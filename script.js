// import { createClient } from '@supabase/supabase-js';

// // Supabase Configuration using Environment Variables
// const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
//     console.error('Supabase credentials are missing. Please check your .env file.');
// }

// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// const feedbackForm = document.getElementById('feedbackForm');
// const submitBtn = document.getElementById('submitBtn');
// const statusMessage = document.getElementById('statusMessage');
// const screenshotInput = document.getElementById('screenshot');
// const imagePreview = document.getElementById('imagePreview');
// const removeImageBtn = document.getElementById('removeImage');
// const toastContainer = document.getElementById('toastContainer');

// // Toast Notification Helper
// function showToast(message, type = 'success') {
//     const toast = document.createElement('div');
//     toast.className = `toast ${type}`;
//     toast.textContent = message;

//     toastContainer.appendChild(toast);

//     // Auto-remove after 4 seconds
//     setTimeout(() => {
//         toast.classList.add('fade-out');
//         setTimeout(() => {
//             toast.remove();
//         }, 300);
//     }, 4000);
// }

// // Helper to update preview
// function updatePreview(file) {
//     if (file) {
//         const reader = new FileReader();
//         reader.onload = function (e) {
//             // Remove existing images if any
//             const existingImg = imagePreview.querySelector('img');
//             if (existingImg) existingImg.remove();

//             const img = document.createElement('img');
//             img.src = e.target.result;
//             img.alt = "Preview";
//             imagePreview.prepend(img);
//             imagePreview.style.display = 'block';
//         }
//         reader.readAsDataURL(file);
//     } else {
//         const existingImg = imagePreview.querySelector('img');
//         if (existingImg) existingImg.remove();
//         imagePreview.style.display = 'none';
//     }
// }

// // Update filename and show preview
// screenshotInput.addEventListener('change', (e) => {
//     const file = e.target.files[0];
//     const fileName = file ? file.name : "Choose image...";
//     document.querySelector('.file-custom').textContent = fileName;
//     updatePreview(file);
// });

// // Remove image logic
// removeImageBtn.addEventListener('click', (e) => {
//     e.stopPropagation();
//     screenshotInput.value = ''; // Reset file input
//     document.querySelector('.file-custom').textContent = "Choose image...";
//     updatePreview(null);
// });

// feedbackForm.addEventListener('submit', async (e) => {
//     e.preventDefault();

//     // Clear previous status
//     statusMessage.style.display = 'none';
//     statusMessage.className = 'status-message';

//     // Set loading state
//     submitBtn.disabled = true;
//     submitBtn.classList.add('loading');

//     try {
//         const username = document.getElementById('username').value;
//         const email = document.getElementById('email').value;
//         const description = document.getElementById('description').value;
//         const file = screenshotInput.files[0];

//         if (!file) throw new Error("Please select a screenshot.");

//         // 1. Upload Screenshot to Supabase Storage
//         const fileExt = file.name.split('.').pop();
//         const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
//         const filePath = `screenshots/${fileName}`;

//         let { error: uploadError, data: uploadData } = await supabase.storage
//             .from('feedback_screenshots')
//             .upload(filePath, file);

//         if (uploadError) throw uploadError;

//         // Get public URL
//         const { data: { publicUrl } } = supabase.storage
//             .from('feedback_screenshots')
//             .getPublicUrl(filePath);

//         // 2. Insert Feedback into Database (Table: feedbacks)
//         const { error: insertError } = await supabase
//             .from('feedbacks') // Updated to match your existing table
//             .insert([
//                 {
//                     username: username,
//                     email: email, // Added email field
//                     description: description,
//                     screenshot_url: publicUrl
//                 }
//             ]);

//         if (insertError) throw insertError;

//         // Success!
//         showToast("Thanks for your feedback!");
//         feedbackForm.reset();
//         document.querySelector('.file-custom').textContent = "Choose image...";
//         updatePreview(null);

//     } catch (error) {
//         console.error('Error:', error);
//         showToast(error.message || "Something went wrong.", "error");
//     } finally {
//         submitBtn.disabled = false;
//         submitBtn.classList.remove('loading');
//     }
// });











import { createClient } from '@supabase/supabase-js';

// Supabase Configuration using Environment Variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Supabase credentials are missing. Please check your .env file.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const feedbackForm = document.getElementById('feedbackForm');
const submitBtn = document.getElementById('submitBtn');
const statusMessage = document.getElementById('statusMessage');
const screenshotInput = document.getElementById('screenshot');
const imagePreview = document.getElementById('imagePreview');
const removeImageBtn = document.getElementById('removeImage');
const toastContainer = document.getElementById('toastContainer');
const assignmentForm = document.getElementById('assignmentForm');
const emailSearchInput = document.getElementById('emailSearch');
const emailOptionsContainer = document.getElementById('emailOptions');
const clientEmailHiddenInput = document.getElementById('clientEmail');
const caNameInput = document.getElementById('ca_name');
const caEmailInput = document.getElementById('ca_email');
const assignBtn = document.getElementById('assignBtn');

const unassignedContainer = document.getElementById('unassignedContainer');
const unassignedList = document.getElementById('unassignedList');
const pendingCountBadge = document.getElementById('pendingCountBadge');

let allEmails = [];

// Tab Switching Logic
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const mainTitle = document.getElementById('mainTitle');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        // Remove active class from all buttons and panes
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        // Add active class to current button and pane
        btn.classList.add('active');
        document.getElementById(targetTab).classList.add('active');

        // Update Header Text & Unassigned Card Visibility
        if (targetTab === 'assignment') {
            mainTitle.textContent = "Client - CA assignment";
            // Check if there are unassigned items before showing
            if (unassignedList.children.length > 0) {
                unassignedContainer.style.display = 'flex';
            }
        } else {
            mainTitle.textContent = "Autofill extension feedback form";
            unassignedContainer.style.display = 'none';
        }
    });
});

// Toast Notification Helper
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}

// Helper to update preview
function updatePreview(file) {
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            // Remove existing images if any
            const existingImg = imagePreview.querySelector('img');
            if (existingImg) existingImg.remove();

            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = "Preview";
            imagePreview.prepend(img);
            imagePreview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    } else {
        const existingImg = imagePreview.querySelector('img');
        if (existingImg) existingImg.remove();
        imagePreview.style.display = 'none';
    }
}

// Update filename and show preview
screenshotInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const fileName = file ? file.name : "Choose image...";
    document.querySelector('.file-custom').textContent = fileName;
    updatePreview(file);
});

// Remove image logic
removeImageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    screenshotInput.value = ''; // Reset file input
    document.querySelector('.file-custom').textContent = "Choose image...";
    updatePreview(null);
});

// Searchable Dropdown Class
class SearchableDropdown {
    constructor(inputId, optionsId, hiddenInputId = null, onSelect = null) {
        this.input = document.getElementById(inputId);
        this.optionsContainer = document.getElementById(optionsId);
        this.hiddenInput = hiddenInputId ? document.getElementById(hiddenInputId) : null;
        this.onSelect = onSelect;
        this.allOptions = [];

        this.init();
    }

    init() {
        this.input.addEventListener('focus', () => {
            this.show();
            this.render();
        });

        this.input.addEventListener('input', (e) => {
            this.render(e.target.value);
            if (this.hiddenInput) this.hiddenInput.value = ''; // Clear selection if typing
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest(`#${this.input.id}`) && !e.target.closest(`#${this.optionsContainer.id}`)) {
                this.hide();
            }
        });
    }

    setOptions(options) {
        this.allOptions = [...new Set(options)].filter(opt => opt && opt.trim() !== '');
    }

    show() {
        this.optionsContainer.classList.add('show');
    }

    hide() {
        this.optionsContainer.classList.remove('show');
    }

    render(filterText = '') {
        this.optionsContainer.innerHTML = '';
        const filtered = this.allOptions.filter(opt =>
            opt.toLowerCase().includes(filterText.toLowerCase())
        );

        if (filtered.length === 0) {
            this.optionsContainer.innerHTML = '<div class="no-results">No options found - but you can type to add and submit.</div>';
        } else {
            filtered.forEach(opt => {
                const div = document.createElement('div');
                div.className = 'option-item';
                div.textContent = opt;
                div.addEventListener('click', () => this.select(opt));
                this.optionsContainer.appendChild(div);
            });
        }
    }

    select(value) {
        this.input.value = value;
        if (this.hiddenInput) this.hiddenInput.value = value;
        this.hide();
        if (this.onSelect) this.onSelect(value);
    }

    setValue(value) {
        this.input.value = value || '';
        if (this.hiddenInput) this.hiddenInput.value = value || '';
    }
}

// Global instances
let emailDropdown, nameDropdown, caEmailDropdown;




function renderUnassigned(profiles) {
    unassignedList.innerHTML = '';
    const unassigned = profiles.filter(p => !p.ca_name || p.ca_name.trim() === '');

    if (pendingCountBadge) {
        pendingCountBadge.textContent = unassigned.length;
    }

    if (unassigned.length === 0) {
        unassignedContainer.style.display = 'none';
        return;
    }

    // Only show if the current tab is assignment
    const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
    if (activeTab === 'assignment') {
        unassignedContainer.style.display = 'flex';
    }
    unassigned.forEach(profile => {
        const item = document.createElement('div');
        item.className = 'unassigned-item';
        item.textContent = profile.email;
        item.title = "Click to assign";
        item.addEventListener('click', () => {
            emailDropdown.select(profile.email);
            // Smoothly scroll to the form
            assignmentForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Focus the name field
            caNameInput.focus();
        });
        unassignedList.appendChild(item);
    });
}

async function fetchDropdownData() {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('email, ca_name, ca_email');

        if (error) throw error;

        const emails = data.map(p => p.email);
        const names = data.map(p => p.ca_name);
        const caEmails = data.map(p => p.ca_email);

        emailDropdown.setOptions(emails);
        nameDropdown.setOptions(names);
        caEmailDropdown.setOptions(caEmails);

        renderUnassigned(data);

    } catch (error) {
        console.error('Error fetching dropdown data:', error);
        showToast("Failed to load suggestions.", "error");
    }
}

async function handleClientEmailSelect(email) {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('ca_name, ca_email')
            .eq('email', email)
            .single();

        if (error) throw error;

        nameDropdown.setValue(data.ca_name);
        caEmailDropdown.setValue(data.ca_email);
    } catch (error) {
        console.error('Error fetching CA data:', error);
        showToast("Failed to load CA details.", "error");
    }
}

// Initialize Dropdowns
emailDropdown = new SearchableDropdown('emailSearch', 'emailOptions', 'clientEmail', handleClientEmailSelect);
nameDropdown = new SearchableDropdown('ca_name', 'caNameOptions');
caEmailDropdown = new SearchableDropdown('ca_email', 'caEmailOptions');

assignmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('clientEmail').value;
    const ca_name = document.getElementById('ca_name').value;
    const ca_email = document.getElementById('ca_email').value;

    if (!email) {
        showToast("Please select a client email.", "error");
        return;
    }

    // 2nd Verification: Confirmation Dialog
    const confirmMessage = `Are you sure you want to assign ${ca_name || 'No Name'} (${ca_email || 'No Email'}) to ${email}?`;
    if (!window.confirm(confirmMessage)) {
        return;
    }

    assignBtn.disabled = true;
    assignBtn.classList.add('loading');

    try {
        const { error } = await supabase
            .from('user_profiles')
            .update({ ca_name, ca_email })
            .eq('email', email);

        if (error) throw error;

        showToast("User assigned successfully!");
        fetchDropdownData(); // Refresh options
    } catch (error) {
        console.error('Error updating CA data:', error);
        showToast(error.message || "Failed to assign user.", "error");
    } finally {
        assignBtn.disabled = false;
        assignBtn.classList.remove('loading');
    }
});

// Initialize app
fetchDropdownData();

feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous status
    statusMessage.style.display = 'none';
    statusMessage.className = 'status-message';

    // Set loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    try {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const description = document.getElementById('description').value;
        const file = screenshotInput.files[0];

        if (!file) throw new Error("Please select a screenshot.");

        // 1. Upload Screenshot to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `screenshots/${fileName}`;

        let { error: uploadError, data: uploadData } = await supabase.storage
            .from('feedback_screenshots')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('feedback_screenshots')
            .getPublicUrl(filePath);

        // 2. Insert Feedback into Database (Table: feedbacks)
        const { error: insertError } = await supabase
            .from('feedbacks') // Updated to match your existing table
            .insert([
                {
                    username: username,
                    email: email, // Added email field
                    description: description,
                    screenshot_url: publicUrl
                }
            ]);

        if (insertError) throw insertError;

        // Success!
        showToast("Thanks for your feedback!");
        feedbackForm.reset();
        document.querySelector('.file-custom').textContent = "Choose image...";
        updatePreview(null);

    } catch (error) {
        console.error('Error:', error);
        showToast(error.message || "Something went wrong.", "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
});

// Sync height of unassignedContainer with container
const container = document.querySelector('.container');
if (container && unassignedContainer) {
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            // Get the total height including padding/border if needed, 
            // but offsetHeight is more reliable for matching visual height
            const height = container.offsetHeight;
            unassignedContainer.style.maxHeight = `${height}px`;
            unassignedContainer.style.height = `${height}px`;
        }
    });
    resizeObserver.observe(container);
}

