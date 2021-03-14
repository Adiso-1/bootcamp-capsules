const baseEndpoint = 'https://apple-seeds.herokuapp.com/api/users/';
const tableContainer = document.querySelector('#table-container');
const header = document.querySelectorAll('.header');
const category = document.querySelectorAll('.category');
const input = document.querySelector('.input');
const spinner = document.querySelector('#spinner');
const main = document.querySelector('#main');
const switcher = document.querySelector('.switch');
const body = document.body;
let searchCategory;
const studentArray = [];
const editCache = {};
const sortCache = {};
const switcherObj = {darkMode: false}
let filteredArray;

class Student {
	constructor(id, firstName, lastName, capsule, age, city, gender, hobby) {
		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.capsule = capsule;
		this.age = age;
		this.city = city;
		this.gender = gender;
		this.hobby = hobby;
	}
}
async function getStudent() {
	const fetchData = await fetch(baseEndpoint);
	const jsonData = await fetchData.json();
	await Promise.all(
		jsonData.map(async (el, i) => {
			const moreData = await fetch(`${baseEndpoint}${i}`);
			const jsonMoreData = await moreData.json();
			const student = new Student(
				el.id,
				el.firstName,
				el.lastName,
				el.capsule,
				jsonMoreData.age,
				jsonMoreData.city,
				jsonMoreData.gender,
				jsonMoreData.hobby
			);
			studentArray.push(student);
		})
	);
	spinner.style.display = 'none';
	main.style.display = 'flex';
	studentArray.sort((a, b) => a.id - b.id);
	filteredArray = [...studentArray];
	if (localStorage.length === 0) {
		localStorage.setItem('students',JSON.stringify(studentArray))
		createTable(studentArray);
	} else {
		createTable(JSON.parse(localStorage.students))
	}
}
const createTable = (arg) => {
	tableContainer.innerHTML = '';
	const keys = ['id','firstName','lastName','capsule','age','city','gender','hobby',];
	const row = document.createElement('thead');
	keys.forEach((header) => {
		const headRow = document.createElement('th');
		headRow.textContent = (header.toString().replace(/([A-Z])/g, ' $1'));
		headRow.textContent = `${headRow.textContent.charAt(0).toUpperCase()}${headRow.textContent.slice(1)}`;
		row.appendChild(headRow);
		tableContainer.appendChild(row);
		headRow.addEventListener('click', (e) => sortRow(e));
	});
	arg.forEach((el) => {
		const row = document.createElement('tr');
		keys.forEach((key) => {
			const tableData = document.createElement('td');
			tableData.textContent = el[key];
			row.appendChild(tableData);
			tableContainer.appendChild(row);
		});
        //! create edit button
		const editButtonContainer = document.createElement('td');
		const editButton = document.createElement('button');
		editButton.addEventListener('click', (e) => edit(e));
		editButton.classList.add('button', 'edit-button');
		editButton.textContent = 'edit';
		editButtonContainer.appendChild(editButton);
		row.appendChild(editButtonContainer);
		tableContainer.appendChild(row);
        
        //! create cancel button
		const cancelButtonContainer = document.createElement('td');
		cancelButtonContainer.classList.add('hidden-td');
		const cancelButton = document.createElement('button');
		cancelButton.addEventListener('click', (e) => cancel(e));
		cancelButton.classList.add('button', 'cancel-button');
		cancelButton.textContent = 'cancel';
		cancelButtonContainer.appendChild(cancelButton);
		row.appendChild(cancelButtonContainer);
		tableContainer.appendChild(row);
        
        //! create confirm button
		const confirmButtonContainer = document.createElement('td');
		confirmButtonContainer.classList.add('hidden-td');
		const confirmButton = document.createElement('button');
		confirmButton.addEventListener('click', (e) => confirm(e));
		confirmButton.classList.add('button', 'confirm-button');
		confirmButton.textContent = 'confirm';
		confirmButtonContainer.appendChild(confirmButton);
		row.appendChild(confirmButtonContainer);
		tableContainer.appendChild(row);
        
        //! create delete button
		const deleteButtonContainer = document.createElement('td');
		const deleteButton = document.createElement('button');
		deleteButton.addEventListener('click', (e) => deleteStudent(e));
		deleteButton.classList.add('button', 'delete-button');
		deleteButton.textContent = 'delete';
		deleteButtonContainer.appendChild(deleteButton);
		row.appendChild(deleteButtonContainer);
		tableContainer.appendChild(row);
	});
};
const sortRow = (e) => {
	let local = JSON.parse(localStorage.students);
	let word = e.target.innerText.replace(' ','');
	let newWord = `${word.charAt(0).toLowerCase()}${word.slice(1)}`;
	if (sortCache[newWord]) {
		sortCache[newWord] = false;	
		local = local.sort((a, b) =>  b[newWord].toString().localeCompare(a[newWord].toString(), undefined, {numeric: true,}));
	} else {
		sortCache[newWord] = true;
		local = local.sort((a, b) =>  a[newWord].toString().localeCompare(b[newWord].toString(), undefined, {numeric: true,}));
	}
	createTable(local);
};
const cancel = (e) => {
    const array = e.target.parentElement.parentElement.childNodes;
    for (let i = 0; i < array.length; i++) {
        if (i > 0 && i < 8) {
            array[i].firstElementChild.remove();
            array[i].innerText = editCache[array[0].textContent][i -1];
        }
    }
    e.target.parentElement.classList.add('hidden-td');
    e.target.parentElement.nextElementSibling.classList.add('hidden-td');
	e.target.parentElement.previousElementSibling.classList.remove('hidden-td');
    e.target.parentElement.nextElementSibling.nextElementSibling.classList.remove('hidden-td');
};
const confirm = (e) => {
	let local = JSON.parse(localStorage.students);
	const keys = ['id','firstName', 'lastName', 'capsule', 'age','city','gender','hobby'];
	let id = parseInt(e.target.parentElement.parentElement.firstElementChild.textContent);
    const array = e.target.parentElement.parentElement.childNodes;
	// Find ID location
	let idOnLocal;
	local.forEach((el,i) => {
		if (el.id === id) {
			idOnLocal = i;
		}
	})
    for (let i = 0; i < array.length; i++) {
        if (i > 0 && i < 8) {
			let textInput = array[i].firstElementChild.value;
			local[idOnLocal][keys[i]] = textInput
			filteredArray[id][keys[i]] = textInput;
            array[i].firstElementChild.remove();
            array[i].innerText = textInput;
        }        
    }
	localStorage.setItem('students',JSON.stringify(local));
	createTable(local)
    e.target.parentElement.classList.add('hidden-td');
    e.target.parentElement.previousElementSibling.classList.add('hidden-td');
    e.target.parentElement.previousElementSibling.previousElementSibling.classList.remove('hidden-td');
    e.target.parentElement.nextElementSibling.classList.remove('hidden-td')
}
const edit = (e) => {
	const childNodesArr = e.path[2].childNodes;
	editCache[childNodesArr[0].textContent] = [];
	for (let i = 0; i < childNodesArr.length; i++) {
		if (i > 0 && i < 8) {
			editCache[childNodesArr[0].textContent].push(
				childNodesArr[i].textContent
			);
			const input = document.createElement('input');
			if (parseInt(childNodesArr[i].textContent)) {
				input.type = 'number';
				input.min = '0';
				input.max = '99';
			}
			input.value = childNodesArr[i].textContent;
			childNodesArr[i].innerHTML = '';
			childNodesArr[i].appendChild(input);
		}
	}
	e.target.parentElement.classList.add('hidden-td');
	e.target.parentElement.nextElementSibling.nextElementSibling.nextElementSibling.classList.add('hidden-td');
	e.target.parentElement.nextElementSibling.classList.remove('hidden-td');
	e.target.parentElement.nextElementSibling.nextElementSibling.classList.remove('hidden-td');
};
const deleteStudent = (e) => {
	let local = JSON.parse(localStorage.students);
	local = local.filter((el) => el.id !== parseInt(e.target.parentElement.parentElement.firstElementChild.textContent));
	localStorage.setItem('students', JSON.stringify(local));
	createTable(local);
}
input.addEventListener('input', (e) => {
	let local = JSON.parse(localStorage.students);
	filteredArray = local.filter((el) => {
		return (el[searchCategory].toString().toLowerCase().indexOf(input.value.toLowerCase()) >= 0);
	});
	createTable(filteredArray);
});
category.forEach((el) => {
	searchCategory = 'id';
	el.addEventListener('change', (e) => {
		input.value = '';
		createTable(studentArray);
		searchCategory = e.target.value;
	});
});
switcher.addEventListener('change', (e) => {
	if (switcherObj.darkMode) {
		switcherObj.darkMode = false;
		body.style.background = '#fff';
		body.style.color = '#000';
	} else {
		body.style.background = '#292929';
		body.style.color = '#fff';
		switcherObj.darkMode = true;
	}
})
getStudent();
