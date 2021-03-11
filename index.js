const baseEndpoint = 'https://apple-seeds.herokuapp.com/api/users/';
const tableContainer = document.querySelector('#table-container');
const header = document.querySelectorAll('.header');
const category = document.querySelectorAll('.category');
const input = document.querySelector('.input');
let searchCategory;
let studentArray = [];

class Student {
    constructor(id,firstName,lastName,capsule,age,city,gender,hobby) {
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
async function getStudent () {
    const fetchData = await fetch(baseEndpoint);
    const jsonData = await fetchData.json();
    await Promise.all(jsonData.map(async(el,i) => {
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
    }))
    studentArray.sort((a,b) => a.id - b.id)
    createTable(studentArray);
}
const createTable = (arg) => {
    tableContainer.innerHTML = '';
    const keys = ['id','firstName','lastName','capsule','age','city','gender','hobby'];
    const row = document.createElement('thead');
    keys.forEach((header) => {
        const headRow = document.createElement('th');
        headRow.setAttribute('sort',false);
        headRow.textContent = header.toString()
        row.appendChild(headRow);
        tableContainer.appendChild(row)
        headRow.addEventListener('click',(e) => {
            if (headRow.getAttribute('sort') === 'false'){
                headRow.attributes.sort.value = 'true'
            } else {
                headRow.attributes.sort.value = 'false'
            } 
            sortRow(e);
        })
    })
    arg.forEach((el) => {
        const row = document.createElement('tr');
        keys.forEach((key) => {
            const tableData = document.createElement('td')
            tableData.textContent = el[key]
            row.appendChild(tableData);
            tableContainer.appendChild(row)
        })
        const editButtonContainer = document.createElement('td');
        const editButton = document.createElement('button')
        editButton.textContent = 'edit';
        editButtonContainer.appendChild(editButton);
        row.appendChild(editButtonContainer);
        tableContainer.appendChild(row)

        const deleteButtonContainer = document.createElement('td');
        const deleteButton = document.createElement('button')
        deleteButton.textContent = 'delete';
        deleteButtonContainer.appendChild(deleteButton);
        row.appendChild(deleteButtonContainer);
        tableContainer.appendChild(row)
    })
}
const sortRow = (e) => {
    studentArray.sort((a,b) => {
        return a[e.target.innerText].toString().localeCompare(b[e.target.innerText].toString(), undefined, {numeric: true,});
    })
    createTable();
}   
input.addEventListener('input', (e) => {
        createTable(studentArray.filter(el => {
            return el[searchCategory].toString().toLowerCase().indexOf(input.value.toLowerCase()) >= 0;
        }))
    })
category.forEach((el) => {
    searchCategory = 'id';
    el.addEventListener('click', (e) => {
        searchCategory = e.target.value;
    })
})
getStudent();

