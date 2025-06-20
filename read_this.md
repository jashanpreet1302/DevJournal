🔧 The Fix: Use cross-env Instead of Bare NODE_ENV=
✅ Step-by-step fix:
1. Install cross-env (if not already installed):
In your project folder (DevKnowledgeCanvas), run:

instead of npm install run this one : because of some environment change variable
npm install --save-dev cross-env
2. Update your package.json scripts:
Find this (✖️ incorrect on Windows):

json
Copy
Edit
"scripts": {
  "dev": "NODE_ENV=development tsx server/index.ts"
}
Replace it with (✔️ works everywhere):

json
Copy
Edit
"scripts": {
  "dev": "cross-env NODE_ENV=development tsx server/index.ts"
}
3. Run your dev script again:
bash
Copy
Edit
npm run dev
✨ Now it will work perfectly on Windows, Mac, and Linux.

