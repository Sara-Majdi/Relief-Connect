# 🚀 Start Here: Get Your AI Features Running!

Your AI features are ready! Just follow these 3 simple steps to get started with **Google Gemini** (free forever!).

---

## Step 1: Get Free Gemini API Key (3 minutes)

### Quick Steps:
1. **Go to:** https://aistudio.google.com/app/apikey
2. **Sign in** with your Google account (any Gmail works!)
3. **Click** "Create API Key" → "Create API key in new project"
4. **Copy** your key (starts with `AIzaSy`)

**That's it!** No credit card, no billing setup, completely free! ✨

---

## Step 2: Add Key to Your Project (1 minute)

### 1. Open `.env` file in your project root

### 2. Find this line:
```
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. Replace with your actual key:
```
GEMINI_API_KEY=AIzaSyC_your_actual_key_here
```

### 4. Save the file

---

## Step 3: Restart Server (30 seconds)

In your terminal:
1. **Stop** current server (Ctrl+C)
2. **Start** again:
   ```bash
   npm run dev
   ```

---

## ✅ You're Done! Test It Now

### Go to: http://localhost:3000/ngo/campaigns/create

### Try These AI Features:

1. **Campaign Title**
   - Select disaster type & location
   - Click "AI" button → Get 3 title suggestions

2. **Descriptions**
   - Click "Generate" button → Auto-write descriptions
   - Or type text and click "Polish" → Improve your writing

3. **Financial Categories**
   - Set funding goal
   - Go to Finances tab → Click "AI Suggest"
   - Get smart expense categories

4. **Fundraising Items**
   - Go to Items tab → Click "AI Suggest Items"
   - Get 5 relevant relief items

---

## 🎉 Why Gemini is Awesome

✅ **Free Forever** - No trial period, no expiration
✅ **No Credit Card** - Just sign in with Google
✅ **1,500 Requests/Day** - More than enough!
✅ **Fast & Reliable** - 2-3 second responses
✅ **High Quality** - Google's latest AI model

---

## 📖 Need More Help?

- **Full Setup Guide:** [GEMINI_SETUP_GUIDE.md](GEMINI_SETUP_GUIDE.md)
- **Migration Details:** [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)
- **Feature Docs:** [AI_FEATURES_README.md](AI_FEATURES_README.md)

---

## 🐛 Quick Troubleshooting

**"API key not configured"**
- Check you added key to `.env` file
- Restart dev server

**"Invalid API key"**
- Verify you copied the entire key
- Should start with `AIzaSy`

**"Rate limit"**
- Free tier: 15/minute, 1500/day
- Wait a minute and try again

---

## 💡 Quick Test Command

Test if it's working:
```bash
curl -X POST http://localhost:3000/api/ai/generate-titles \
  -H "Content-Type: application/json" \
  -d "{\"disaster\":\"flood\",\"location\":\"Kuantan\"}"
```

Should return 3 campaign titles! 🎯

---

**Ready? Get your API key and start creating AI-powered campaigns in under 5 minutes!** 🚀

[Get API Key →](https://aistudio.google.com/app/apikey)
