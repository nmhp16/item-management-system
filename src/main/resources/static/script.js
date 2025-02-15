let editingItemName = ''; // Variable to keep track of the item being edited


// Function to load items from the server and display them in a table
function loadItems(query = '') {
    fetch('/items')
        .then(response => response.json())
        .then(items => {
            const filteredItems = items.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
            const itemListDiv = document.getElementById('itemList');
            if (filteredItems.length === 0) {
                itemListDiv.innerHTML = '<p>No items found.</p>'; // Display message if no items are found
                document.getElementById('totalPrice').textContent = '0.00'; // Reset total price
                return;
            }

            // Generate HTML for the items table
            let tableHtml = '<table><thead><tr><th>Name</th><th>Quantity</th><th>Price</th><th>Brand</th><th>Serial Number</th><th>Actions</th></tr></thead><tbody>';
            filteredItems.forEach(item => {
                tableHtml += `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>$${item.price.toFixed(2)}</td>
                        <td>${item.tags.find(tag => tag.startsWith('Brand:')).substring(6)}</td>
                        <td>${item.tags.find(tag => tag.startsWith('Serial:')).substring(8)}</td>
                        <td>
                            <button id="editButton" onclick="showEditForm('${item.name}', '${item.quantity}', '${item.price}', '${item.tags.find(tag => tag.startsWith('Brand:')).substring(6)}', '${item.tags.find(tag => tag.startsWith('Serial:')).substring(8)}')">Edit</button>
                            <button id="deleteButton" onclick="deleteItem('${item.name}')">Delete</button>
                        </td>
                    </tr>
                `;
            });
            tableHtml += '</tbody></table>';
            itemListDiv.innerHTML = tableHtml;
            loadTotalPrice(); // Load the total price of all items
        })
        .catch(error => {
            console.error('Error fetching items:', error); // Log error if fetching fails
            document.getElementById('itemList').innerHTML = '<p>Error loading items.</p>'; // Display error message
        });
}

// Function to add a new item to the server
function addItem(event) {
    event.preventDefault(); // Prevent form submission from reloading the page
    const name = document.getElementById('name').value;
    const quantity = document.getElementById('quantity').value;
    const price = document.getElementById('price').value;
    const brand = document.getElementById('brand').value;
    const serial = document.getElementById('serial').value;
    
    fetch('/items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            quantity: quantity,
            price: price,
            tags: [`Brand: ${brand}`, `Serial: ${serial}`]
        })
    })
    .then(response => response.json())
    .then(() => {
        loadItems(); // Reload items after adding
        document.getElementById('addItemForm').reset(); // Reset the form fields
    })
    .catch(error => {
        console.error('Error adding item:', error); // Log error if adding fails
    });
}

// Function to delete an item by name
function deleteItem(name) {
    fetch(`/items/${name}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            loadItems(); // Reload items after deletion
        } else {
            console.error('Error deleting item:', response.statusText); // Log error if deletion fails
        }
    })
    .catch(error => {
        console.error('Error deleting item:', error); // Log error if deletion fails
    });
}

// Function to search for items based on a query string
function searchItems() {
    const query = document.getElementById('searchInput').value;
    loadItems(query); // Reload items with the search query
}

// Function to load and display the total price of all items
function loadTotalPrice() {
    fetch('/items/total-price')
        .then(response => response.json())
        .then(totalPrice => {
            document.getElementById('totalPrice').textContent = totalPrice.toFixed(2); // Update total price display
        })
        .catch(error => {
            console.error('Error fetching total price:', error); // Log error if fetching fails
        });
}

// Function to display the edit form with pre-filled item details
function showEditForm(name, quantity, price, brand, serial) {
    const editFormContainer = document.getElementById('editFormContainer');
    document.getElementById('editName').value = name;
    document.getElementById('editQuantity').value = quantity;
    document.getElementById('editPrice').value = price;
    document.getElementById('editBrand').value = brand.trim(); // Trim whitespace
    document.getElementById('editSerial').value = serial;
    editingItemName = name; // Set the item being edited
    editFormContainer.style.display = 'block'; // Show the edit form
}

// Function to cancel editing and hide the edit form
function cancelEdit() {
    document.getElementById('editFormContainer').style.display = 'none'; // Hide the edit form
}

// Function to update an item with new details
function updateItem(event) {
    event.preventDefault(); // Prevent form submission from reloading the page
    const newName = document.getElementById('editName').value;
    const newQuantity = document.getElementById('editQuantity').value;
    const newPrice = document.getElementById('editPrice').value;
    const newBrand = document.getElementById('editBrand').value;
    const newSerial = document.getElementById('editSerial').value;

    fetch(`/items/${editingItemName}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: newName || editingItemName,
            quantity: newQuantity || 0,
            price: newPrice || 0,
            tags: [`Brand: ${newBrand}`, `Serial: ${newSerial}`]
        })
    })
    .then(response => {
        if (response.ok) {
            loadItems(); // Reload items after updating
            cancelEdit(); // Hide the edit form
        } else {
            console.error('Error updating item:', response.statusText); // Log error if updating fails
        }
    })
    .catch(error => {
        console.error('Error updating item:', error); // Log error if updating fails
    });
}

// Initial setup: add event listeners and load items
document.getElementById('addItemForm').addEventListener('submit', addItem);
document.getElementById('editItemForm').addEventListener('submit', updateItem);
loadItems(); // Load items when the page loads