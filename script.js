const STORAGE_KEY = 'pujaHandmadeProducts';
const DEFAULT_PASSWORD = 'puja123';
const ADMIN_SESSION_KEY = 'pujaHandmadeAdminLoggedIn';

function getProducts() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse products', error);
    }
  }

  const seededProducts = [
    {
      id: 1,
      name: 'Herbal Candle Set',
      category: 'Home Decor',
      price: 1800,
      description: 'A calming candle set crafted with natural wax and soothing scents.',
      image: 'https://images.unsplash.com/photo-1602872029706-0d42d7f0d7c6?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 2,
      name: 'Handwoven Basket',
      category: 'Lifestyle',
      price: 2400,
      description: 'A beautifully woven basket made by hand for storage and display.',
      image: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 3,
      name: 'Clay Trinket Dish',
      category: 'Decor',
      price: 1200,
      description: 'Minimal, earthy ceramic dish ideal for keys, jewelry, or table styling.',
      image: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=900&q=80'
    }
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(seededProducts));
  return seededProducts;
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0
  }).format(value);
}

function renderProducts() {
  const productsGrid = document.getElementById('productsGrid');
  if (!productsGrid) return;

  const products = getProducts();

  if (!products.length) {
    productsGrid.innerHTML = '<p class="empty-state">No products available yet.</p>';
    return;
  }

  productsGrid.innerHTML = products
    .map(
      (product) => `
        <article class="product-card">
          <img src="${product.image}" alt="${product.name}" />
          <div class="product-body">
            <div class="product-meta">
              <span>${product.category}</span>
            </div>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-footer">
              <span class="product-price">${formatCurrency(product.price)}</span>
            </div>
          </div>
        </article>
      `
    )
    .join('');
}

function isAdminLoggedIn() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}

function setAdminLoggedIn(value) {
  sessionStorage.setItem(ADMIN_SESSION_KEY, String(value));
}

function renderAdminProducts() {
  const list = document.getElementById('adminProductsList');
  if (!list) return;

  const products = getProducts();

  if (!products.length) {
    list.innerHTML = '<p>No products added yet.</p>';
    return;
  }

  list.innerHTML = products
    .map(
      (product) => `
        <div class="admin-product-row">
          <div>
            <h4>${product.name}</h4>
            <p>${product.category} • ${formatCurrency(product.price)}</p>
          </div>
          <button class="delete-btn" data-id="${product.id}">Delete</button>
        </div>
      `
    )
    .join('');
}

function handleProductSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('productName').value.trim();
  const category = document.getElementById('productCategory').value.trim();
  const price = Number(document.getElementById('productPrice').value);
  const description = document.getElementById('productDescription').value.trim();
  const fileInput = document.getElementById('productImage');
  const file = fileInput.files[0];

  if (!name || !category || !description || !price) {
    alert('Please fill in all product details.');
    return;
  }

  const products = getProducts();

  const uploadImage = () => {
    if (!file) {
      return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80';
    }

    const reader = new FileReader();
    reader.onload = function () {
      products.push({
        id: Date.now(),
        name,
        category,
        price,
        description,
        image: reader.result
      });
      saveProducts(products);
      renderProducts();
      renderAdminProducts();
      event.target.reset();
    };
    reader.readAsDataURL(file);
  };

  uploadImage();
}

function handleDeleteProduct(event) {
  const deleteBtn = event.target.closest('.delete-btn');
  if (!deleteBtn) return;

  const id = Number(deleteBtn.dataset.id);
  const products = getProducts().filter((product) => product.id !== id);
  saveProducts(products);
  renderProducts();
  renderAdminProducts();
}

function handleAdminLogin(event) {
  event.preventDefault();
  const password = document.getElementById('adminPassword').value;

  if (password === DEFAULT_PASSWORD) {
    setAdminLoggedIn(true);
    window.location.href = 'admin.html';
  } else {
    alert('Incorrect password. Please try again.');
  }
}

function initAdminPage() {
  const loginBox = document.getElementById('loginBox');
  const adminPanel = document.getElementById('adminPanel');
  const loginForm = document.getElementById('adminLoginForm');
  const productForm = document.getElementById('productForm');
  const logoutButtons = [
    document.getElementById('logoutBtn'),
    document.getElementById('logoutBtnSecondary')
  ];

  if (loginForm) {
    loginForm.addEventListener('submit', handleAdminLogin);
  }

  if (productForm) {
    productForm.addEventListener('submit', handleProductSubmit);
  }

  if (adminPanel) {
    if (isAdminLoggedIn()) {
      loginBox.classList.add('hidden');
      adminPanel.classList.remove('hidden');
      renderAdminProducts();
    } else {
      adminPanel.classList.add('hidden');
      loginBox.classList.remove('hidden');
    }
  }

  logoutButtons.forEach((button) => {
    if (!button) return;
    button.addEventListener('click', () => {
      setAdminLoggedIn(false);
      window.location.href = 'admin.html';
    });
  });

  const adminProductsList = document.getElementById('adminProductsList');
  if (adminProductsList) {
    adminProductsList.addEventListener('click', handleDeleteProduct);
  }
}

function init() {
  renderProducts();
  initAdminPage();
}

document.addEventListener('DOMContentLoaded', init);
