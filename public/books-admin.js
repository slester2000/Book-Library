
//==== MANAGE BOOK TABLE =====
async function loadBooksAdmin(){
    const res = await fetch('/books');
    const books =await res.json()

    const tbody =document.getElementById('manage-books-table');
    tbody.innerHTML ="";

    books.forEach(book => {
        const tr = document.createElement('tr');
        console.log(book)
        const active = book.is_active ? "Y": "N";

        tr.innerHTML=`
        <td>${book.title}</td>
        <td>${book.total_copies}</td>
        <td>${active}</td>
        <td><button onclick(editBook${book.id})>Edit</button></td>
        `
        tbody.appendChild(tr);
    });

}

// EDIT BOOK LOGIC (TODO: BUILD MODAL WINDOW, CREATE THE HTTP REQUEST)
loadBooksAdmin()