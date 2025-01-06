import './index.css'; 

let brands = [];
let products = [];

// Handle brand addition
document.getElementById('addBrandButton').addEventListener('click', () => {
  const brand = document.getElementById('brand').value;
  if (!brand) {
    alert('Please enter a valid brand.');
    return;
  }
  brands.push(brand);
  updateBrandList();
  updateProductBrandOptions();
  document.getElementById('brand').value = ''; // Clear input field
});

// Update the list of brands
function updateBrandList() {
  const brandListElement = document.getElementById('brandList');
  brandListElement.innerHTML = ''; // Clear current list

  brands.forEach(brand => {
    const listItem = document.createElement('li');
    listItem.classList.add('product-item');
    listItem.textContent = brand;
    brandListElement.appendChild(listItem);
  });
}

// Update the product brand dropdown
function updateProductBrandOptions() {
  const productBrandSelect = document.getElementById('productBrand');
  productBrandSelect.innerHTML = '<option value="" disabled selected>Select a brand</option>'; // Reset options

  brands.forEach(brand => {
    const option = document.createElement('option');
    option.value = brand;
    option.textContent = brand;
    productBrandSelect.appendChild(option);
  });
}

// Handle product addition
document.getElementById('addProductButton').addEventListener('click', () => {
  const productPrice = document.getElementById('productPrice').value;
  const productBrand = document.getElementById('productBrand').value;

  if (!productPrice || isNaN(productPrice) || productPrice <= 0 || !productBrand) {
    alert('Please enter a valid product price and select a brand.');
    return;
  }

  products.push({ price: parseFloat(productPrice), brand: productBrand });
  updateProductList();
  document.getElementById('productPrice').value = ''; // Clear input field
  document.getElementById('productBrand').value = ''; // Clear select field
});

// Update the list of products
function updateProductList() {
  const productListElement = document.getElementById('productList');
  productListElement.innerHTML = ''; // Clear current list

  products.forEach(product => {
    const listItem = document.createElement('li');
    listItem.classList.add('product-item');
    listItem.textContent = `${product.brand}: $${product.price.toFixed(2)}`;
    productListElement.appendChild(listItem);
  });
}

// Handle sending notifications
document.getElementById('sendButton').addEventListener('click', async () => {
  const token = document.getElementById('token').value;
  const startNumber = document.getElementById('startNumber').value;
  const notificationInterval = document.getElementById('notificationInterval').value;
  const notificationsPerInterval = document.getElementById('notificationsPerInterval').value;
  const notificationsCount = document.getElementById('notificationsCount').value;

  if (!startNumber || !notificationInterval || !notificationsCount || !notificationsPerInterval || !token || products.length === 0) {
    alert('Please fill in all fields.');
    return;
  }

  const orderPrefix = "Order #";
  let currentOrderNumber = parseInt(startNumber);
  let sentNotifications = 0;

  // En lugar de setInterval, usaremos un bucle async para asegurarnos de que las notificaciones se envíen una por una
  for (let i = 0; sentNotifications < notificationsCount; i++) {
    // Group products by brand
    const productsByBrand = brands.map(brand => products.filter(product => product.brand === brand));

    // Randomly select a brand and then select products from that brand
    const randomBrandProducts = productsByBrand[Math.floor(Math.random() * productsByBrand.length)];

    // Randomly select 1, 2, or 3 products, allowing repetition
    const itemsCount = Math.floor(Math.random() * 3) + 1;
    const selectedProducts = [];
    let totalPrice = 0;

    for (let j = 0; j < itemsCount; j++) {
      const randomProduct = randomBrandProducts[Math.floor(Math.random() * randomBrandProducts.length)];
      selectedProducts.push(randomProduct);
      totalPrice += randomProduct.price;
    }

    // Assuming all selected products are from the same brand, we get the brand from the first product
    const brandName = selectedProducts[0].brand;
    const itemsWord = itemsCount === 1 ? 'item' : 'items';
    const description = `$${totalPrice.toFixed(2)}, ${itemsCount} ${itemsWord} from Online Store · ${brandName}`;

    // En lugar de hacer el envío inmediatamente, ahora hacemos un "await" para cada notificación
    for (let j = 0; j < notificationsPerInterval && sentNotifications < notificationsCount; j++) {
      const message = {
        token: token,
        title: `${orderPrefix}${currentOrderNumber}`,
        body: description,
        sound: 'shopify_purchase_sound.wav',
        data: { withSome: 'data' },
      };

      try {
        // Agrega un "await" aquí para esperar a que la solicitud de la notificación termine antes de continuar
        const response = await fetch('https://shopinoti-backend.onrender.com/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        });

        const result = await response.json();

        if (response.ok) {
          sentNotifications++;
          currentOrderNumber++; // Increment order number
          console.log(`Notification sent: Order #${currentOrderNumber - 1}, Description: ${description}`);
        } else {
          console.error('Error sending notification:', result);
        }

      } catch (error) {
        console.error('Network error:', error);
        break;  // Stop the loop in case of an error
      }
    }

    // Pausar el bucle durante el intervalo especificado
    await new Promise(resolve => setTimeout(resolve, notificationInterval * 1000));
  }

  document.getElementById('message').textContent = 'All notifications have been sent.';
});
