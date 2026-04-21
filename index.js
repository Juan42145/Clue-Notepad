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
	renderCards()
	forceCSS()
})

function renderCards(){
	renderSection('suspects', suspects)
	renderSection('weapons', weapons)
	renderSection('rooms', rooms)
}

function renderSection(id, list){
	const Grid = document.getElementById(id)
	
	list.forEach(item => {
		const Row = createDiv(Grid, 'row')

		const Name = createDiv(Row, 'cell cell--name')
		createTxt(Name, 'div', 'cell__title', item)
		for (let i = 0; i < 6; i++){
			const Cell = createDiv(Row, 'cell')
			const Block = createDiv(Cell, 'cell__block')

			createIcon(Block)
			const Notes = createDiv(Block, 'block__notes')
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
	UseElement.setAttribute('href', '/Assets/sprites.svg#')
	SvgElement.append(UseElement)
	parent.append(SvgElement)
}

function renderPlayers(){}
