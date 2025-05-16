const GEMINI_API_KEY = 'Your API Key'; // Replace with your Gemini API key

document.addEventListener('DOMContentLoaded', async () => {
  const urlInput = document.getElementById('urlInput');
  const scanBtn = document.getElementById('scanBtn');
  const resultDiv = document.getElementById('result');

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentUrl = tab.url;
  urlInput.value = currentUrl;

  scanBtn.addEventListener('click', async () => {
    resultDiv.textContent = '⏳ Scanning with Gemini...';

    const isThreat = await checkWithGemini(currentUrl);
    resultDiv.style.color = isThreat ? 'red' : 'green';
    resultDiv.textContent = isThreat
      ? "🚨 Gemini detected this URL as potentially malicious!"
      : "✅ Gemini thinks this URL is safe.";
  });
});

async function checkWithGemini(url) {
  const prompt = `Check if the following URL is malicious or suspicious. Respond with only "malicious", "suspicious", or "safe". URL: ${url}`;

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase();
    return reply && (reply.includes('malicious') || reply.includes('suspicious'));
  } catch (error) {
    console.error('Gemini API error:', error);
    return false;
  }
}
