const fs = require('fs');

function replaceFile(path, replacer) {
  let content = fs.readFileSync(path, 'utf8');
  content = replacer(content);
  fs.writeFileSync(path, content);
}

// 1. auth.route.ts
replaceFile('apps/api/src/routes/auth.route.ts', c => {
  return c.replace(/targetExamDate,/g, 'targetExamDate: targetExamDate || undefined,')
          .replace(/parentEmail,/g, 'parentEmail: parentEmail || undefined,')
          .replace(/new Date\(targetExamDate\)/g, 'targetExamDate ? new Date(targetExamDate as string) : undefined');
});

// 2. dashboard.route.ts
replaceFile('apps/api/src/routes/dashboard.route.ts', c => {
  return c.replace(/new Date\(query\.from\)/g, 'query.from ? new Date(query.from as string) : undefined')
          .replace(/new Date\(query\.to\)/g, 'query.to ? new Date(query.to as string) : undefined');
});

// 3. mood.route.ts
replaceFile('apps/api/src/routes/mood.route.ts', c => {
  return c.replace(/new Date\(query\.from\)/g, 'query.from ? new Date(query.from as string) : undefined')
          .replace(/new Date\(query\.to\)/g, 'query.to ? new Date(query.to as string) : undefined');
});

// 4. wellness.route.ts
replaceFile('apps/api/src/routes/wellness.route.ts', c => {
  return c.replace(/examType: user\.examType,/g, 'examType: user.examType as any,');
});

// 5. wellness.service.ts
replaceFile('apps/api/src/services/wellness.service.ts', c => {
  return c.replace(/type: fallback\.type,/g, 'type: fallback.type as any,')
          .replace(/return saved;/g, 'return saved as any;');
});

// 6. pattern-detection.job.ts
replaceFile('apps/api/src/jobs/pattern-detection.job.ts', c => {
  let patched = c.replace(/const activeSession = sessions\[sessions\.length - 1\];/g, 'const activeSession = sessions[sessions.length - 1];\n    if (!activeSession) return false;');
  patched = patched.replace(/details: \{([^}]+)\}/g, 'details: {$1} as any');
  return patched;
});

// 7. tests
replaceFile('apps/api/src/services/pomodoro.service.test.ts', c => c.replace(/pomodoro\.service/g, 'pomodoro.service.js'));
replaceFile('apps/api/src/services/gamification.service.test.ts', c => c.replace(/gamification\.service/g, 'gamification.service.js'));

console.log('Done');
