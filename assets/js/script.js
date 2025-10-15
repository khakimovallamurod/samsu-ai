let messages = [];

function showToast(title, message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const icons = {
        success: `<svg class="toast-icon" fill="none" stroke="#10b981" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>`,
        warning: `<svg class="toast-icon" fill="none" stroke="#f59e0b" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>`
    };
    
    toast.innerHTML = `
        ${icons[type]}
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function showClearModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <div class="modal-icon">⚠️</div>
                <div class="modal-title">Chatni tozalash</div>
            </div>
            <div class="modal-body">
                Barcha suhbat tarixi o'chiriladi. Bu amalni bekor qilib bo'lmaydi. Davom etishni xohlaysizmi?
            </div>
            <div class="modal-actions">
                <button class="modal-btn modal-btn-secondary" onclick="closeModal()">Bekor qilish</button>
                <button class="modal-btn modal-btn-primary" onclick="confirmClear()">Ha, tozalash</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
}

function closeModal() {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) overlay.remove();
}

function confirmClear() {
    document.getElementById('messagesContainer').innerHTML = '';
    document.getElementById('messagesContainer').classList.add('hidden');
    document.getElementById('welcomeScreen').classList.remove('hidden');
    messages = [];
    closeModal();
    showToast('Muvaffaqiyatli', 'Chat tarixi tozalandi', 'success');
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (message === '') return;

    hideWelcomeScreen();
    addMessage('user', message);
    input.value = '';
    input.style.height = 'auto';

    setTimeout(() => {
        showTypingIndicator();
        // Call async function
        addBotResponse(message).then(() => {
            hideTypingIndicator();
        }).catch(() => {
            hideTypingIndicator();
        });
    }, 500);
}

function sendSuggestion(text) {
    const input = document.getElementById('messageInput');
    input.value = text;
    sendMessage();
}

function hideWelcomeScreen() {
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('messagesContainer').classList.remove('hidden');
}
function addMessage(type, text, quickReplies = []) {
    const container = document.getElementById('messagesContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    text = text.replace(/\\n/g, '\n');

    const formattedText = text.replace(/\n/g, '<br>');

    const time = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    
    let quickRepliesHTML = '';
    if (quickReplies.length > 0) {
        quickRepliesHTML = '<div class="quick-replies">';
        quickReplies.forEach(reply => {
            quickRepliesHTML += `<button class="quick-reply-btn" onclick="sendSuggestion('${reply}')">${reply}</button>`;
        });
        quickRepliesHTML += '</div>';
    }
    
    const avatarContent = type === 'bot' 
        ? '<img src="assets/images/SamDU logo full 1.png" alt="Bot">'
        : 'S';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatarContent}</div>
        <div class="message-content">
            <div class="message-bubble">${formattedText}</div>
            <div class="message-time">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                </svg>
                ${time}
            </div>
            ${quickRepliesHTML}
        </div>
    `;
    
    container.appendChild(messageDiv);
    scrollToBottom();
}


function showTypingIndicator() {
    const container = document.getElementById('messagesContainer');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <img src="assets/images/SamDU logo full 1.png" alt="Bot">
        </div>
        <div class="message-content">
            <div class="message-bubble">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        </div>
    `;
    container.appendChild(typingDiv);
    scrollToBottom();
}

function hideTypingIndicator() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
}

async function addBotResponse(userMessage) {
    try {
        const response = await fetch('http://ai.sampc.uz/ai/chat/getdata', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userMessage
            })
        });

        const data = await response.json();

        if (data.status === 'success' && data.response) {
            // Format the response text - preserve line breaks and structure
            const formattedResponse = formatResponseText(data.response);
            addMessage('bot', formattedResponse);
        } else {
            // Error handling
            addMessage('bot', 'Kechirasiz, javob olishda xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.');
            showToast('Xatolik', 'Serverdan javob olishda muammo yuz berdi', 'warning');
        }
    } catch (error) {
        console.error('API Error:', error);
        addMessage('bot', 'Kechirasiz, tarmoq xatoligi yuz berdi. Iltimos, internet ulanishingizni tekshiring va qaytadan urinib ko\'ring.');
        showToast('Tarmoq xatoligi', 'Serverga ulanib bo\'lmadi', 'warning');
    }
}

function formatResponseText(text) {
    if (!text) return '';
    
    // Clean up the text first
    let formatted = text.trim();
    
    // Convert numbered lists (1. 2. 3. etc)
    formatted = formatted.replace(/^(\d+)\.\s+(.+)$/gm, '<li>$2</li>');
    
    // Convert dash lists (- item)
    formatted = formatted.replace(/^-\s+(.+)$/gm, '<li>$1</li>');
    
    // Wrap consecutive <li> tags in <ul>
    formatted = formatted.replace(/(<li>.*?<\/li>\s*)+/g, function(match) {
        return '<ul>' + match + '</ul>';
    });
    
    // Convert **bold** to <strong> tags
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *italic* to <em> tags  
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert double line breaks to paragraphs
    formatted = formatted.replace(/\n\n/g, '</p><p>');
    
    // Convert single line breaks to <br>
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Wrap in paragraph tags if not already wrapped
    if (!formatted.startsWith('<ul>') && !formatted.startsWith('<p>')) {
        formatted = '<p>' + formatted + '</p>';
    }
    
    // Convert markdown links [text](url) to HTML links
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Convert plain URLs to clickable links
    formatted = formatted.replace(
        /(?<!href=")(https?:\/\/[^\s<]+)/g, 
        '<a href="$1" target="_blank">$1</a>'
    );
    
    // Convert email addresses to mailto links
    formatted = formatted.replace(
        /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g,
        '<a href="mailto:$1">$1</a>'
    );
    
    // Convert phone numbers to tel links (Uzbekistan format)
    formatted = formatted.replace(
        /(\+998\d{9}|\d{9})/g,
        '<a href="tel:$1">$1</a>'
    );
    
    return formatted;
}

function copyToClipboard(text, button) {
    // Remove HTML tags for plain text copy
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    navigator.clipboard.writeText(plainText).then(() => {
        const originalHTML = button.innerHTML;
        button.innerHTML = `
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            Nusxalandi
        `;
        button.classList.add('copied');
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copied');
        }, 2000);
        
        showToast('Muvaffaqiyatli', 'Matn nusxalandi', 'success');
    }).catch(err => {
        console.error('Copy failed:', err);
        showToast('Xatolik', 'Nusxalashda xatolik yuz berdi', 'warning');
    });
}

function scrollToBottom() {
    const chatArea = document.getElementById('chatArea');
    chatArea.scrollTo({
        top: chatArea.scrollHeight,
        behavior: 'smooth'
    });
}
