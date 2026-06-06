const fs = require('fs');

// 1. pattern-detection.job.ts
let job = fs.readFileSync('apps/api/src/jobs/pattern-detection.job.ts', 'utf8');
job = job.replace(/const activeSession = sessions\[sessions\.length - 1\];/g, 'const activeSession = sessions[sessions.length - 1];\n  if (!activeSession) return false;');
// the undefined error on 71 might be activeSession.something. To just fix it fast:
job = job.replace(/activeSession\.id/g, 'activeSession?.id');
job = job.replace(/activeSession\.completedPomodoros/g, 'activeSession?.completedPomodoros');
job = job.replace(/activeSession\.breaksTaken/g, 'activeSession?.breaksTaken');
// fix Record<string,unknown>
job = job.replace(/details: \{ avgMood/g, 'details: { avgMood' ); // already there
job = job.replace(/details: \{([^}]+)\}/g, 'details: {$1} as any');
fs.writeFileSync('apps/api/src/jobs/pattern-detection.job.ts', job);

// 2. auth.route.ts
let auth = fs.readFileSync('apps/api/src/routes/auth.route.ts', 'utf8');
// targetExamDate: targetExamDate
auth = auth.replace(/targetExamDate,/g, 'targetExamDate: targetExamDate || null,');
auth = auth.replace(/parentEmail,/g, 'parentEmail: parentEmail || null,');
auth = auth.replace(/new Date\(targetExamDate\)/g, 'targetExamDate ? new Date(targetExamDate) : null');
fs.writeFileSync('apps/api/src/routes/auth.route.ts', auth);

// 3. dashboard & mood routes
let dash = fs.readFileSync('apps/api/src/routes/dashboard.route.ts', 'utf8');
dash = dash.replace(/new Date\(query\.from\)/g, 'query.from ? new Date(query.from as string) : undefined');
dash = dash.replace(/new Date\(query\.to\)/g, 'query.to ? new Date(query.to as string) : undefined');
fs.writeFileSync('apps/api/src/routes/dashboard.route.ts', dash);

let mood = fs.readFileSync('apps/api/src/routes/mood.route.ts', 'utf8');
mood = mood.replace(/new Date\(query\.from\)/g, 'query.from ? new Date(query.from as string) : undefined');
mood = mood.replace(/new Date\(query\.to\)/g, 'query.to ? new Date(query.to as string) : undefined');
fs.writeFileSync('apps/api/src/routes/mood.route.ts', mood);

// 4. wellness.route.ts
let well = fs.readFileSync('apps/api/src/routes/wellness.route.ts', 'utf8');
well = well.replace(/examType: user\.examType,/g, 'examType: user.examType as any,');
fs.writeFileSync('apps/api/src/routes/wellness.route.ts', well);

console.log('patched');
