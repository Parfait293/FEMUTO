// Configuration FEMUTO
const FUNDRAISING_GOAL = 10000000; // 10 millions FCFA
const DB_NAME = "femuto_donations_db";
let currentLanguage = 'fr';
let selectedAmount = 0;

// Initialiser la base de données
function initDatabase() {
    if (!localStorage.getItem(DB_NAME)) {
        const db = {
            donations: [],
            settings: {
                minDonation: 100,
                goal: FUNDRAISING_GOAL
            }
        };
        localStorage.setItem(DB_NAME, JSON.stringify(db));
    }
    updateDonationCounter();
}

// Obtenir la base de données
function getDatabase() {
    return JSON.parse(localStorage.getItem(DB_NAME));
}

// Sauvegarder la base de données
function saveDatabase(db) {
    localStorage.setItem(DB_NAME, JSON.stringify(db));
}

// Compte à rebours
function updateCountdown() {
    const targetDate = new Date('2025-10-29');
    const now = new Date();
    const diff = targetDate - now;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

// Compteur de dons
function updateDonationCounter() {
    const db = getDatabase();
    const totalRaised = db.donations.reduce((sum, donation) => sum + donation.amount, 0);
    const progress = (totalRaised / FUNDRAISING_GOAL) * 100;
    
    document.getElementById('amountRaised').textContent = totalRaised.toLocaleString() + ' FCFA';
    document.getElementById('progressFill').style.width = Math.min(progress, 100) + '%';
}

// Gestion des options de montant
function setupAmountOptions() {
    document.querySelectorAll('.amount-option').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.amount-option').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('customAmount').value = '';
            selectedAmount = parseInt(this.dataset.amount);
            updateDonationAmount(selectedAmount);
        });
    });
    
    document.getElementById('customAmount').addEventListener('input', function() {
        document.querySelectorAll('.amount-option').forEach(b => b.classList.remove('active'));
        const amount = parseInt(this.value);
        if (amount >= 100) {
            selectedAmount = amount;
            updateDonationAmount(amount);
        } else if (this.value !== '') {
            selectedAmount = 0;
            updateDonationAmount(0);
        }
    });
}

function updateDonationAmount(amount) {
    document.getElementById('donationAmount').textContent = amount.toLocaleString() + ' FCFA';
    document.getElementById('totalAmount').textContent = amount.toLocaleString() + ' FCFA';
}

// Gestion du système de paiement
function setupPaymentSystem() {
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.querySelectorAll('.payment-method').forEach(method => {
                method.classList.remove('active');
            });
            
            if (this.value === 'fedapay') {
                document.getElementById('fedapay-payment').classList.add('active');
            } else if (this.value === 'card') {
                document.getElementById('card-payment').classList.add('active');
            }
        });
    });
}

// Simuler le traitement du paiement
function processPayment(donationData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                transactionId: `TX-${Math.floor(10000000 + Math.random() * 90000000)}`,
                timestamp: new Date().toISOString()
            });
        }, 2000);
    });
}

// Gestion du formulaire de don
function setupDonationForm() {
    const form = document.getElementById('donationForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (selectedAmount < 100) {
            alert('Le montant minimum du don est de 100 FCFA');
            return;
        }
        
        const donation = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            amount: selectedAmount,
            paymentMethod: document.querySelector('input[name="payment"]:checked').value,
            paymentStatus: 'pending',
            timestamp: new Date().toISOString()
        };
        
        const submitBtn = document.querySelector('.submit-button');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement du don...';
        
        try {
            const paymentResult = await processPayment(donation);
            
            if (paymentResult.success) {
                donation.transactionId = paymentResult.transactionId;
                donation.paymentStatus = 'paid';
                donation.paymentDate = paymentResult.timestamp;
                
                const db = getDatabase();
                donation.id = Date.now();
                db.donations.push(donation);
                saveDatabase(db);
                
                document.getElementById('transactionId').textContent = donation.transactionId;
                document.getElementById('paymentAmount').textContent = donation.amount.toLocaleString() + ' FCFA';
                document.getElementById('paymentMethod').textContent = 
                    donation.paymentMethod === 'fedapay' ? 'FedaPay' : 'Carte bancaire';
                
                document.getElementById('confirmationModal').style.display = 'flex';
                
                this.reset();
                selectedAmount = 0;
                updateDonationAmount(0);
                updateDonationCounter();
                
            } else {
                alert('Le paiement a échoué. Veuillez réessayer.');
            }
        } catch (error) {
            console.error('Erreur de paiement:', error);
            alert('Une erreur est survenue lors du traitement du don.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-heart"></i> Faire un Don';
        }
    });
}

function closeConfirmationModal() {
    document.getElementById('confirmationModal').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Changement de langue
function changeLanguage(lang) {
    currentLanguage = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Navigation fluide
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Menu mobile
function setupMobileMenu() {
    document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
        const navLinks = document.querySelector('.nav-links');
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initDatabase();
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    setupAmountOptions();
    setupPaymentSystem();
    setupDonationForm();
    setupSmoothScrolling();
    setupMobileMenu();
});