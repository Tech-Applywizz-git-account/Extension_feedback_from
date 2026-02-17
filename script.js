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
