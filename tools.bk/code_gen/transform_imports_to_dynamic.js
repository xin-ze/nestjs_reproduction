/**
 * Transform imports to dynamic imports,
 *
 * input:
 *
 * import {
      TableCarMakeBestCarriersStatic,
      TableCarMakeBestCarriersStaticConfig,
    } from './table_car_make_best_carriers_static/TableCarMakeBestCarriersStatic';


 * output:
 *
 * import { config as TableCarMakeBestCarriersStaticConfig } from './table_car_make_best_carriers_static/graphql';
 * const TableCarMakeBestCarriersStatic = dynamic(() =>
     import('./table_car_make_best_carriers_static/TableCarMakeBestCarriersStatic').then(
     (mod) => mod.TableCarMakeBestCarriersStatic
     )
   );

 */

const fs = require('fs');
const path = require('path');
let FILE_PATH = path.resolve(__dirname, '../../libs/seo-submodule/seo-sections/src/lib/markdown/DataTables/index.ts');
const content = fs.readFileSync(FILE_PATH, 'utf-8');
//import { TableCarBestCarriers, TableCarBestCarriersConfig } from './table_car_best_carriers/TableCarBestCarriers';
const regex1 = /import \{\s*([\w]+)\,\s*([\w]+)\,?\s*\} from \'([\w\/\.]+)\'\;/g;
let array1;

while ((array1 = regex1.exec(content)) !== null) {
  // console.log(`Found ${array1[0]}. Next starts at ${regex1.lastIndex}.`);
  let names = array1.slice(1, 3);
  let configName = names.filter((a) => a.toLowerCase().includes('config'))[0];
  let componentName = names.filter((a) => !a.toLowerCase().includes('config'))[0];
  let path = array1[3];
  let configPath = path.replace(/\w+$/, 'graphql');
  // console.log(names,path)
  let output = `import { config as ${configName} } from '${configPath}';

const ${componentName} = dynamic(() =>
  import('${path}').then(
    (mod) => mod.${componentName}
  )
);`;

  console.log(output);
}
