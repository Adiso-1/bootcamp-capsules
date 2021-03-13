const baseEndpoint = 'https://apple-seeds.herokuapp.com/api/users/';
const tableContainer = document.querySelector('#table-container');
const header = document.querySelectorAll('.header');
const category = document.querySelectorAll('.category');
const input = document.querySelector('.input');
let searchCategory;
const studentArray = [];
const editCache = {};
const sortCache = {};
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
	studentArray.sort((a, b) => a.id - b.id);
	filteredArray = [...studentArray];
	createTable(studentArray);
}
const createTable = (arg) => {
	tableContainer.innerHTML = '';
	const keys = [
		'id',
		'firstName',
		'lastName',
		'capsule',
		'age',
		'city',
		'gender',
		'hobby',
	];
	const row = document.createElement('thead');
	keys.forEach((header) => {
		const headRow = document.createElement('th');
		headRow.setAttribute('sort', false);
		headRow.textContent = header.toString();
		row.appendChild(headRow);
		tableContainer.appendChild(row);
		headRow.addEventListener('click', (e) => {
			if (headRow.getAttribute('sort') === 'false') {
				headRow.attributes.sort.value = 'true';
			} else {
				headRow.attributes.sort.value = 'false';
			}
			sortRow(e);
		});
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
		deleteButton.textContent = 'delete';
		deleteButtonContainer.appendChild(deleteButton);
		row.appendChild(deleteButtonContainer);
		tableContainer.appendChild(row);
	});
};
const sortRow = (e) => {
	if (sortCache[e.target.innerText]) {
		sortCache[e.target.innerText] = false;	
		filteredArray.sort((a, b) =>  b[e.target.innerText].toString().localeCompare(a[e.target.innerText].toString(), undefined, {numeric: true,}));
	} else {
		sortCache[e.target.innerText] = true;
		filteredArray.sort((a, b) =>  a[e.target.innerText].toString().localeCompare(b[e.target.innerText].toString(), undefined, {numeric: true,}));
	}
	createTable(filteredArray);
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
	const keys = ['id','firstName', 'lastName', 'capsule', 'age','city','gender','hobby'];
	let id = parseInt(e.target.parentElement.parentElement.firstElementChild.textContent);
    const array = e.target.parentElement.parentElement.childNodes;
    for (let i = 0; i < array.length; i++) {
        if (i > 0 && i < 8) {
            let textInput = array[i].firstElementChild.value;
			filteredArray[id][keys[i]] = textInput;
            array[i].firstElementChild.remove();
            array[i].innerText = textInput;
        }        
    }
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
	filteredArray = filteredArray.filter((el) => el.id !== parseInt(e.target.parentElement.parentElement.firstElementChild.textContent));
	createTable(filteredArray);
}
input.addEventListener('input', (e) => {
	filteredArray = studentArray.filter((el) => {
		return (
			el[searchCategory]
				.toString()
				.toLowerCase()
				.indexOf(input.value.toLowerCase()) >= 0
		);
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
getStudent();
