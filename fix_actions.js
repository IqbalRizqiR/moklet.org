const fs = require('fs');
const path = require('path');

const dir = 'src/app/(admin)/admin/events/[id]/committee/_components';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (!file.endsWith('.tsx')) return;
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/createRoleAction/g, 'createEventRoleAction');
  content = content.replace(/updateRoleAction/g, 'updateEventRoleAction');
  content = content.replace(/deleteRoleAction/g, 'deleteEventRoleAction');
  content = content.replace(/createLevelAction/g, 'createEventLevelAction');
  content = content.replace(/deleteLevelAction/g, 'deleteEventLevelAction');
  content = content.replace(/assignMemberAction/g, 'assignEventMemberAction');

  fs.writeFileSync(filePath, content);
});

console.log("Action names updated.");
