# 🐙 How to Upload Your Project to GitHub (Beginner Guide)

Since I've already prepared your files locally, you just need to connect them to the internet (GitHub).

### Step 1: Get your Link
1.  Go to your new repository page on **GitHub.com**.
2.  Look for the green **"Code"** button or the setup section.
3.  Copy the **HTTPS URL**. It looks like this:
    `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git`

### Step 2: Open the Command Center
1.  In VS Code, look at the top menu.
2.  Click **Terminal** -> **New Terminal**.
3.  (Or press `Ctrl + J` / `Cmd + J`).

### Step 3: Connect & Upload
Paste these 3 commands one by one into the terminal and press **Enter** after each one.

**Command 1: Link your computer to GitHub**
(Replace the URL below with YOUR copied URL)
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```
*(If it says "error: remote origin already exists", skip to Command 2)*

**Command 2: Name the main branch**
```bash
git branch -M main
```

**Command 3: Send files to GitHub**
```bash
git push -u origin main
```

### What happens next?
- You might see a pop-up asking to sign in to GitHub. Click **Sign in with Browser** and authorize it.
- In the terminal, you'll see a % bar uploading objects.
- When it's done, **Refresh your GitHub page**. You will see all your files! 🚀
