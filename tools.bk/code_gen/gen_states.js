/* eslint-disable */

// NOTICE: this is a helper script
// to generate states code (useState, initialize, hasChanges) from interface statement
// done by string processing and assemble to destined form

// run this directly on node, result will output in console, you can copy the result and paste to project source code file
// modify value of `p` to get customized result

const p = `  id?: string;
  slug?: string;
  valid: boolean;
  published: boolean;
  markAsAnswered: boolean;

  questionTitle: string;
  questionDetail?: string;
  answer?: string;
  answeredAt?: string;
  questionerName?: string;
  questionerPhone?: string;
  answererName?: string;
  answererTitle?: string;
  answererAvatar?: string;

  tagsID?: string[];
  tags?: Tag[];
  assignedAnswerUserID?: string;
  assignedAnswerUser?: User;
  answeredByUser?: User;
  categoryID: string;
  category: Category;
  createdAt: string;
  updatedAt: string;`;

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const lines = [];
for (const line of p.split('\n')) {
  if (line.trim()) {
    const isOpt = line.includes('?');
    let [name, type] = line.split(/\??:\s*/);
    name = name.trim();
    if (type) type = type.replace(/;$/, '').trim();
    lines.push({
      isOpt,
      name,
      type,
    });
  }
}
// console.log(lines);

for (i of lines) {
  console.log(`const [${i.name}, set${capitalizeFirstLetter(i.name)}] = useState<${i.type} | undefined>(undefined);`);
}

console.log(`if(item){`);
for (i of lines) {
  console.log(`  set${capitalizeFirstLetter(i.name)}(item.${i.name});`);
}
console.log(`}else{`);
for (i of lines) {
  console.log(`  set${capitalizeFirstLetter(i.name)}(undefined);`);
}
console.log(`}\n\n`);

console.log(`const hasChanges = useMemo(() => {
  if (data?.node) {`)
for (i of lines) {
  console.log(`    if (data.node.${i.name} !== ${i.name}) return true;`);
}

console.log(`// No changes if creating a new article.
    return false;
  }
  }, [`)
for (i of lines) {
  console.log(`    ${i.name},`);
}
console.log(`  ]);`)
