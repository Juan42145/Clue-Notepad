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
let weapons = ['Candlestick', 'Dagger', 'Lead Pipe', 'Revolver', 'Rope', 'Wrench']
let rooms = ['Ballroom', 'Billiard Room', 'Conservatory', 'Dining Room', 'Hall', 'Kitchen', 'Library', 'Lounge', 'Study']
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
	
	list.forEach(item => {
		const Row = createDiv(Grid, 'row')

		const Name = createDiv(Row, 'cell cell--name')
		createTxt(Name, 'div', 'cell__title', item)
		for (let i = 0; i < 6; i++){
			const Cell = createDiv(Row, 'cell')

			const Block = createDiv(Cell, 'cell__block', {'data-col':i})
			Block.addEventListener('click', () => selectCell(Block))

			createIcon(Block)
			const Notes = createDiv(Block, 'block__notes js-notes')
			//test
			// createTxt(Notes, 'div', 'block__note', 1)
			// createTxt(Notes, 'div', 'block__note', 2)
			// createTxt(Notes, 'div', 'block__note', 3)
			// createTxt(Notes, 'div', 'block__note', 4)
			// createTxt(Notes, 'div', 'block__note', 5)
		}
	})
}

function createIcon(parent){
	const SvgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
	const UseElement = document.createElementNS('http://www.w3.org/2000/svg', 'use')
	SvgElement.setAttribute('class', 'block__icon')
	SvgElement.append(UseElement)
	parent.append(SvgElement)
}

//Players
function renderPlayers(){
	const Cont = document.getElementById('players')
	Cont.textContent = ""

	players.forEach(player => {
		if (!player) return
		const Player = createDiv(Cont, 'player')
		createTxt(Player, 'div', 'player__text', player)
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
let op

function selectNote(btn, code){
	if (btn.classList.contains('active')){
		btn.classList.remove('active')
		op = ''
	} else{
		let active = document.querySelector('.active')
		if (active) active.classList.remove('active')
		btn.classList.add('active')
		op = code
	}
}

function selectCell(cell){
	const COL = cell.dataset.col
	//if edit on
	if (!op) return //None

	if (op === 'Delete'){ //Delete
		setIcon(cell.querySelector('use'))
		cell.querySelector('.js-notes').textContent = ""
		processOrder(COL)
	}
	else if (isNaN(op)){ //Icons
		const Icon = cell.querySelector('use')
		let code = Icon.href.baseVal.split('#')[1]
		if (op === code) setIcon(Icon) //Delete icon when tapped again
		else{
			let style = ''
			if (op === 'Check') style = 'icon--green'
			if (op === 'X') style = 'icon--red'
			setIcon(Icon, op, style)
		}
	}
	else{ //Numbers
		const Notes = cell.querySelector('.js-notes')
		
		const Note = Notes.querySelector(`[data-note="${op}"]`)
		if(Note) Note.remove()
		else createTxt(Notes, 'div', '', op, {'data-note':op})
		
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

	const List = document.querySelectorAll(`[data-col="${col}"] .js-notes:has(*)`)
	List.forEach(group => {
		if (group.children.length == 1) return
		//Set index of first item as group index
		let gIndex = numIndex[group.children[0].dataset.note]
		Array.from(group.children).forEach(item => {
			let i = numIndex[item.dataset.note]
			if (i == gIndex) return //If already pointed to the same bucket do nothing
			//Merge buckets
			buckets[gIndex] = buckets[gIndex].concat(buckets[i])
			buckets[i] = []
			//Point to new bucket
			numIndex[item.dataset.note] = gIndex
		})
	})

	buckets.forEach(bucket => {
		bucket.forEach((num, i) => {
			let notes = document.querySelectorAll(`[data-col="${col}"] [data-note="${num}"]`)
			notes.forEach(element => {
				element.className = 'note--'+(1+i)
			})
		})
	})
}

