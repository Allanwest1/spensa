// School Functions Updates - Dynamic Content Management

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const navList = document.querySelector('.nav-list');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            navList.classList.toggle('active');
            
            // Change icon
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }
    
    // Filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const updateCards = document.querySelectorAll('.update-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            // Filter cards
            updateCards.forEach(card => {
                if (filterValue === 'all') {
                    card.style.display = 'flex';
                } else {
                    if (card.getAttribute('data-category') === filterValue) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
            
            // Update count of visible cards
            updateVisibleCount();
        });
    });
    
    // Save button functionality
    const saveButtons = document.querySelectorAll('.save-btn');
    
    saveButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('saved');
            this.classList.toggle('far');
            this.classList.toggle('fas');
            
            const cardTitle = this.closest('.update-card').querySelector('.update-title').textContent;
            const isSaved = this.classList.contains('saved');
            
            if (isSaved) {
                // Save to localStorage
                saveToLocalStorage(cardTitle);
                showNotification('Update saved for later viewing');
            } else {
                // Remove from localStorage
                removeFromLocalStorage(cardTitle);
                showNotification('Update removed from saved items');
            }
        });
    });
    
    // Load more functionality
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const shownCount = document.getElementById('shownCount');
    const totalCount = document.getElementById('totalCount');
    
    // Set initial counts
    const initialVisible = 8;
    const totalUpdates = 24;
    shownCount.textContent = initialVisible;
    totalCount.textContent = totalUpdates;
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // Simulate loading more content
            const currentShown = parseInt(shownCount.textContent);
            const newShown = Math.min(currentShown + 4, totalUpdates);
            
            shownCount.textContent = newShown;
            
            // If all loaded, disable button
            if (newShown >= totalUpdates) {
                this.disabled = true;
                this.textContent = 'All Updates Loaded';
                this.style.opacity = '0.7';
                this.style.cursor = 'default';
            }
            
            showNotification(`Loaded ${newShown - currentShown} more updates`);
        });
    }
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            
            if (searchTerm.length > 0) {
                // Filter cards based on search term
                updateCards.forEach(card => {
                    const title = card.querySelector('.update-title').textContent.toLowerCase();
                    const excerpt = card.querySelector('.update-excerpt').textContent.toLowerCase();
                    const category = card.querySelector('.update-category').textContent.toLowerCase();
                    
                    if (title.includes(searchTerm) || excerpt.includes(searchTerm) || category.includes(searchTerm)) {
                        card.style.display = 'flex';
                        
                        // Highlight search term
                        highlightText(card, searchTerm);
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                // Update visible count
                updateVisibleCount();
            } else {
                // Reset if search is cleared
                updateCards.forEach(card => {
                    card.style.display = 'flex';
                    removeHighlights(card);
                });
                
                // Reset to current filter
                const activeFilter = document.querySelector('.filter-btn.active');
                if (activeFilter && activeFilter.getAttribute('data-filter') !== 'all') {
                    activeFilter.click();
                }
                
                updateVisibleCount();
            }
        });
    }
    
    // Subscribe form
    const subscribeForm = document.querySelector('.subscribe-form');
    
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (validateEmail(email)) {
                // In a real application, you would send this to a server
                // For now, we'll simulate success
                emailInput.value = '';
                showNotification('Successfully subscribed to updates!', 'success');
                
                // Save to localStorage
                saveSubscription(email);
            } else {
                showNotification('Please enter a valid email address', 'error');
            }
        });
    }
    
    // Initialize saved items from localStorage
    initializeSavedItems();
    
    // Helper Functions
    function updateVisibleCount() {
        const visibleCards = document.querySelectorAll('.update-card[style*="display: flex"]').length;
        shownCount.textContent = visibleCards;
    }
    
    function saveToLocalStorage(title) {
        let savedItems = JSON.parse(localStorage.getItem('savedSchoolUpdates')) || [];
        if (!savedItems.includes(title)) {
            savedItems.push(title);
            localStorage.setItem('savedSchoolUpdates', JSON.stringify(savedItems));
        }
    }
    
    function removeFromLocalStorage(title) {
        let savedItems = JSON.parse(localStorage.getItem('savedSchoolUpdates')) || [];
        savedItems = savedItems.filter(item => item !== title);
        localStorage.setItem('savedSchoolUpdates', JSON.stringify(savedItems));
    }
    
    function initializeSavedItems() {
        const savedItems = JSON.parse(localStorage.getItem('savedSchoolUpdates')) || [];
        
        // Mark saved items in the UI
        updateCards.forEach(card => {
            const cardTitle = card.querySelector('.update-title').textContent;
            if (savedItems.includes(cardTitle)) {
                const saveBtn = card.querySelector('.save-btn');
                saveBtn.classList.add('saved', 'fas');
                saveBtn.classList.remove('far');
            }
        });
    }
    
    function highlightText(element, searchTerm) {
        removeHighlights(element);
        
        // Highlight in title
        const title = element.querySelector('.update-title');
        highlightElement(title, searchTerm);
        
        // Highlight in excerpt
        const excerpt = element.querySelector('.update-excerpt');
        highlightElement(excerpt, searchTerm);
    }
    
    function highlightElement(element, searchTerm) {
        const text = element.textContent;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const newText = text.replace(regex, '<mark>$1</mark>');
        
        // Only update if matches were found
        if (newText !== text) {
            element.innerHTML = newText;
        }
    }
    
    function removeHighlights(element) {
        const marks = element.querySelectorAll('mark');
        marks.forEach(mark => {
            const parent = mark.parentNode;
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
            parent.normalize();
        });
    }
    
    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    function saveSubscription(email) {
        let subscriptions = JSON.parse(localStorage.getItem('schoolUpdatesSubscriptions')) || [];
        if (!subscriptions.includes(email)) {
            subscriptions.push(email);
            localStorage.setItem('schoolUpdatesSubscriptions', JSON.stringify(subscriptions));
        }
    }
    
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background-color: ${type === 'error' ? '#F44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-weight: 500;
            transform: translateY(-20px);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
            notification.style.opacity = '1';
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateY(-20px)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Print functionality
    const printButtons = document.querySelectorAll('.print-btn');
    printButtons.forEach(button => {
        button.addEventListener('click', function() {
            window.print();
        });
    });
    
    // Keyboard navigation for accessibility
    document.addEventListener('keydown', function(e) {
        // Close mobile menu on Escape
        if (e.key === 'Escape' && navList.classList.contains('active')) {
            mobileToggle.click();
        }
        
        // Focus trap for mobile menu
        if (navList.classList.contains('active')) {
            const focusableElements = navList.querySelectorAll('a, button');
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];
            
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        }
    });
    
    // Add print styles dynamically
    const printStyles = `
        @media print {
            .header, .footer, .filter-options, .sidebar, 
            .save-btn, .load-more-container, .mobile-toggle {
                display: none !important;
            }
            
            .main-content {
                display: block !important;
            }
            
            .updates-grid {
                grid-template-columns: 1fr !important;
            }
            
            .update-card {
                break-inside: avoid;
                box-shadow: none !important;
                border: 1px solid #ddd !important;
                margin-bottom: 20px;
            }
            
            body {
                font-size: 12pt;
                color: black;
                background: white;
            }
            
            a {
                color: black;
                text-decoration: underline;
            }
            
            .read-more::after {
                content: " (" attr(href) ")";
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = printStyles;
    document.head.appendChild(styleSheet);
    
    console.log('School Functions Updates page initialized successfully.');
});