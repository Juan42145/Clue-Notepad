"use strict";

/**--STORAGE-- */
const myStorage = localStorage;

function set(key, obj){myStorage.setItem(key, JSON.stringify(obj))}
function get(key){return JSON.parse(myStorage.getItem(key))}
function has(key){return get(key) !== null}
function reset(){myStorage.clear()}

/**--STORAGE VARIABLES-- */
function setData(data){set('data', data)}
function getData(){return get('data')}

/**--CREATE FUNCTION-- */
function create(parent, element, attributes){
	//Create HTML Element
	const Element = document.createElement(element); parent.append(Element);
	if (!attributes) return Element;
	Object.entries(attributes).forEach(([attribute, value]) => {
		Element.setAttribute(attribute, value);
	})
	return Element;
}

function createDiv(parent, cls = '', attributes = {}){
	if (cls != '') Object.assign(attributes, {'class':cls})
	return create(parent, 'div', attributes)
}

function createTxt(parent, element, cls, text, attributes = {}){
	if (cls != '') Object.assign(attributes, {'class':cls})
	const Element = create(parent, element, attributes)
	Element.textContent = text;
	return Element
}

function forceCSS(){
	document.body.style.zoom = 1.0000001;
	setTimeout(function(){document.body.style.zoom = 1;},50); 
}

/**--PAGE-- */
let suspects = ['Green', 'Mustard', 'Peacock', 'Plum', 'Scarlett', 'White']
let weapons = [
	'Candlestick', 'Dagger', 'Lead Pipe', 'Revolver', 'Rope', 'Wrench']
let rooms = [
	'Ballroom', 'Billiard Room', 'Conservatory','Dining Room',
	'Hall', 'Kitchen', 'Library', 'Lounge', 'Study']
let players = []

window.addEventListener('load',() => {
	renderRows('suspects', suspects)
	renderRows('weapons', weapons)
	renderRows('rooms', rooms)
	renderPlayers()
	forceCSS()
})

function renderRows(id, list){
	const Grid = document.getElementById(id)
	
	list.forEach((item, ri) => {
		const Row = createDiv(Grid, 'row', {'id': id[0]+'-r'+ri})

		const Name = createDiv(Row, 'cell cell--name')
		Name.addEventListener('click', () => selectRow(Row, Name))
		createTxt(Name, 'div', 'cell__title', item)
		for (let i = 0; i < 6; i++){
			const Cell = createDiv(Row, 'cell', {'data-col':i})
			Cell.addEventListener('click', () => selectCell(Cell))

			const Block = createDiv(Cell, 'cell__block')
			createIcon(Block)
			const Notes = createDiv(Block, 'block__notes js-notes')
		}
	})
}

function createIcon(parent){
	const SvgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
	const UseEl = document.createElementNS('http://www.w3.org/2000/svg', 'use')
	SvgEl.setAttribute('class', 'block__icon')
	SvgEl.append(UseEl)
	parent.append(SvgEl)
}

//Players
function renderPlayers(){
	const Cont = document.getElementById('players')
	Cont.textContent = ""
	const Style = document.documentElement.style;

	players.forEach((player, i) => {
		if (!player) {
			Style.removeProperty('--c'+i);
			return
		}
		const Player = createDiv(Cont, 'player')
		createTxt(Player, 'div', 'player__text', player)
		Player.addEventListener('click', () => highlightCol(i))
		// Add column styling
		Style.setProperty('--c'+i, 'var(--grid)'); 
	})
}

/**--PLAYERS MENU-- */
function openMenu(){
	//Initialize inputs
	for (let i = 0; i < 6; i++) {
		document.getElementById('p'+(1+i)).value = players[i] || ""
	}

	document.getElementById('edit-players').showModal();
}

function handleForm(form){
	const formData = new FormData(form);
	const data = Array.from(formData.values());

	players = data.sort((a, b) => (a === '') - (b === ''));//Move empty spots

	renderPlayers()
	document.getElementById('edit-players').close();
}

/**--NOTES-- */
let op = '', control = ''
let edit = false, curCell = null;

//Interface
function setEdit(btn, bool){
	btn.classList.add('hide')
	let showId = bool ? 'off' : 'on'
	document.getElementById('edit-'+showId).classList.remove('hide')

	if (bool){
		selectCell(curCell) //reset cell highlight
		document.getElementById('notes').classList.remove('disabled')
	} else{
		document.getElementById('notes').classList.add('disabled')
		selectNote(null, op) //reset note selection
	}

	edit = bool
}

function selectNote(btn, code){
	if(!edit) {
		setCell(curCell, code)
		return
	}

	if (op !== '') document.querySelector('.active').classList.remove('active')
	
	if (op === code) op = ''
	else{
		btn.classList.add('active')
		op = code
	}
}

function selectControl(btn, code){
	if (control !== '')
		document.querySelector('.selected').classList.remove('selected')
	
	if (control === code) control = ''
	else{
		btn.classList.add('selected')
		control = code
	}
}

//Interactions
function selectRow(row, cell){
	if (control === '') highlightRow(row)
	else{
		if(control === 's') cell.classList.toggle('cell--strike')
		else if(control === 'c') cell.classList.toggle('cell--circle')
		
		if (!edit) selectControl(null, control)//Clear control
	}
}

function selectCell(cell){
	edit ? setCell(cell, op) : highlightCell(cell)
}

function setCell(cell, action){
	if (!action) return //None
	const COL = cell.dataset.col

	if (action === 'Delete'){ //Delete
		setIcon(cell.querySelector('use'))
		cell.querySelector('.js-notes').textContent = ""
		processOrder(COL)
	}
	else if (isNaN(action)){ //Icons
		const Icon = cell.querySelector('use')
		let code = Icon.href.baseVal.split('#')[1]
		if (action === code) setIcon(Icon) //Delete icon when tapped again
		else{
			let style = ''
			if (action === 'Check') style = 'icon--green'
			if (action === 'X') style = 'icon--red'
			setIcon(Icon, action, style)
		}
	} else{ //Numbers
		const Notes = cell.querySelector('.js-notes')
		
		const Note = Notes.querySelector(`[data-note="${action}"]`)
		if(Note) Note.remove()
		else createTxt(Notes, 'div', '', action, {'data-note':action})
		
		processOrder(COL)
	}
}

function setIcon(element, name, cls){
	if(name) element.setAttribute('href', 'Assets/sprites.svg#' + name)
	else element.removeAttribute('href')

	if (cls) element.setAttribute('class', cls)
	else element.removeAttribute('class')
}

function processOrder(col){
	const buckets = [[1],[2],[3],[4],[5]]
	const numIndex = Object.fromEntries(buckets.map(n => [n, n-1]));
	const colQuery = `[data-col="${col}"]`

	const List = document.querySelectorAll(colQuery+' .js-notes:has(*)')
	List.forEach(group => {
		if (group.children.length == 1) return
		//Set index of first item as group index
		let gIndex = numIndex[group.children[0].dataset.note]
		Array.from(group.children).forEach(item => {
			let i = numIndex[item.dataset.note]
			if (i == gIndex) return //If pointing to the same bucket do nothing
			//Merge buckets
			buckets[gIndex] = buckets[gIndex].concat(buckets[i])
			buckets[i] = []
			//Point to new bucket
			numIndex[item.dataset.note] = gIndex
		})
	})

	buckets.forEach(bucket => {
		bucket.forEach((num, i) => {
			let notes = document.querySelectorAll(colQuery+` [data-note="${num}"]`)
			notes.forEach(element => {
				element.className = 'note--'+(1+i)
			})
		})
	})
}

/**--HIGHLIGHTING-- */
let hl = {'col':'','s':'','w':'','r':'',};

function highlightCol(col){
	const Style = document.documentElement.style;
	
	//Undo previous highlight
	if (hl.col !== '') Style.removeProperty('--cb'+hl.col);
	
	if (col === hl.col) hl.col = ''
	else{
		Style.setProperty('--cb'+col, 'var(--highlight)'); 
		hl.col = col
	}
}

function highlightRow(rowEl){
	let [key, row] = rowEl.id.split('-r')
	
	//Undo previous highlight
	if (hl[key] !== '')
		document.getElementById(key+'-r'+hl[key]).classList.remove('row--hl')
	
	if (row === hl[key]) hl[key] = ''
	else{
		document.getElementById(key+'-r'+row).classList.add('row--hl')
		hl[key] = row
	}
}

function highlightCell(cell){
	if (curCell !== null)
		document.querySelector('.highlight').classList.remove('highlight')

	if (cell === curCell){
		curCell = null
		document.getElementById('notes').classList.add('disabled')
	}
	else{
		cell.classList.add('highlight')
		curCell = cell
		document.getElementById('notes').classList.remove('disabled')
	}
}
