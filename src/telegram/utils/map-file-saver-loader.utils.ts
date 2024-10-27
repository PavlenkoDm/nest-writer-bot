import * as path from 'path';
import * as fsSync from 'fs';

const filePathToDir = path.join(process.cwd(), 'maps');

export function saveMapData(map: Map<string, number>, fileName: string) {
  try {
    const mapData = JSON.stringify(Array.from(map.entries())); //to trasform Map to arr
    const filePathWithName = path.join(filePathToDir, `${fileName}.json`);
    fsSync.writeFileSync(filePathWithName, mapData, 'utf8');
    return;
  } catch (error) {
    console.error(`Error to write file: ${fileName}`, error);
    return;
  }
}

function loadMapData(fileName: string) {
  try {
    const filePathWithName = path.join(filePathToDir, `${fileName}.json`);
    const data = fsSync.readFileSync(filePathWithName, 'utf8');
    const entries = JSON.parse(data);
    return new Map<string, number>(entries); // restore Map from arr
  } catch (error) {
    // console.error(`Error to load file: ${fileName}`, error);
    return null;
  }
}

function deleteMapFile(fileName: string) {
  try {
    const filePathWithName = path.join(filePathToDir, `${fileName}.json`);
    fsSync.unlinkSync(filePathWithName);
    // console.log(`File: ${fileName}.json deleted.`);
    return;
  } catch (error) {
    // console.error(`File: ${fileName}.json deleting error.`, error);
    return;
  }
}

export function mapInit(fileName: string) {
  const initializedMap = loadMapData(fileName);
  if (initializedMap !== null) {
    deleteMapFile(fileName);
    return initializedMap;
  }
  return null;
}
