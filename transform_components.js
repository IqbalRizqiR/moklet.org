const fs = require('fs');
const path = require('path');

const dir = 'src/app/(admin)/admin/events/[id]/committee/_components';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (!file.endsWith('.tsx')) return;
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Perform precise variable mappings
  content = content.replace(/organisasiId/g, 'eventId');
  content = content.replace(/organisasi_id/g, 'event_id');
  
  // Specific model replacements
  content = content.replace(/Org_Custom_Role/g, 'Event_Custom_Role');
  content = content.replace(/Org_Level/g, 'Event_Level');
  content = content.replace(/Org_Member/g, 'Event_Member');
  content = content.replace(/Org_Permission/g, 'Event_Permission'); // Although event uses granular booleans
  
  // Action replacements
  content = content.replace(/actions\/orgCustomRole/g, 'actions/eventCommittee');
  
  // Component names
  content = content.replace(/OrgStructurePreview/g, 'EventStructurePreview');
  content = content.replace(/MembersClientContainer/g, 'EventMembersClientContainer');

  fs.writeFileSync(filePath, content);
});

console.log("Transformation complete.");
