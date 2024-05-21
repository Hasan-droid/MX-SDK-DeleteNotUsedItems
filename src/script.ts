import { MendixPlatformClient } from "mendixplatformsdk";
import dotenv from "dotenv";
import chalk from "chalk";
dotenv.config();
async function main() {
  // Specify the module name within the Mendix application

  // Initialize the Mendix SDK client
  const client = new MendixPlatformClient();

  // Connect to the Mendix app using a hidden app ID
  const app = client.getApp(process.env.MENDIX_APP_ID!);

  // Create a temporary working copy of the branch use trunk or main
  const workingCopy = await app.createTemporaryWorkingCopy("trunk");

  // Open the model for the working copy
  const model = await workingCopy.openModel();
  // Prepare a structure to store unused items
  const allModulesNames = model.allModules().map((module) => module.name);
  for (const moduleName of allModulesNames) {
    const unused = {
      pages: [],
      nanoflows: [],
      otherMicroflows: [],
    };
    // Cache for storing serialized data to optimize lookups
    const serializedCache = {};
    // Find unused items and log them
    try {
      console.log(`starting to find unused items in module ${chalk.white.bold.underline(moduleName)}`);
      await findUnusedItems(model, moduleName, unused, serializedCache);
      console.log("Unused items found:", unused);
      console.log(chalk.blue.bold("------------------------------------------"));
    } catch (error) {
      console.error(`An error occurred during execution: ${error}`);
    }
  }

  // Commit changes if any unused items were found and deleted
  try {
    await model.flushChanges();
    await workingCopy.commitToRepository("trunk", {
      commitMessage: "Deleted unused items.",
    });
    console.log("Changes committed successfully!");
  } catch (error) {
    console.error(`An error occurred during execution: ${error}`);
  }
}

// Main function to find unused items within a specific module
async function findUnusedItems(model, moduleName, unused, serializedCache) {
  await findUnusedMicroflows(model, moduleName, unused, serializedCache);
  await findUnusedNanoflows(model, moduleName, unused, serializedCache);
  await findUnusedPages(model, moduleName, unused, serializedCache);
}

// Find and delete unused microflows in the module
async function findUnusedMicroflows(model, moduleName, unused, serializedCache) {
  // Filter microflows within the specified module
  const microflowsInModule = model
    .allMicroflows()
    .filter((microflow) => microflow.qualifiedName.startsWith(moduleName + "."));

  // Check each microflow for usage and delete if unused
  for (const microflow of microflowsInModule) {
    const usages = await findUsages(model, microflow.qualifiedName, serializedCache);
    const usedInNavigation = await isUsedInNavigation(model, microflow.qualifiedName);
    if (usages === 0 && !usedInNavigation) {
      unused.otherMicroflows.push(microflow.qualifiedName);
      const mf = await microflow.load();
      mf.delete();
    }
  }
}

// Similar to microflows, find and delete unused nanoflows
async function findUnusedNanoflows(model, moduleName, unused, serializedCache) {
  // Filter nanoflows within the specified module
  const nanoflowsInModule = model
    .allNanoflows()
    .filter((nanoflow) => nanoflow.qualifiedName.startsWith(moduleName + "."));

  // Check each nanoflow for usage and delete if unused
  for (const nanoflow of nanoflowsInModule) {
    const usages = await findUsages(model, nanoflow.qualifiedName, serializedCache);
    const usedInNavigation = await isUsedInNavigation(model, nanoflow.qualifiedName);
    if (usages === 0 && !usedInNavigation) {
      unused.nanoflows.push(nanoflow.qualifiedName);
      const nf = await nanoflow.load();
      nf.delete();
    }
  }
}

// Similar to microflows and nanoflows, find and delete unused pages
async function findUnusedPages(model, moduleName, unused, serializedCache) {
  // Filter pages within the specified module
  const pagesInModule = model.allPages().filter((page) => page.qualifiedName.startsWith(moduleName + "."));

  // Check each page for usage and delete if unused
  for (const page of pagesInModule) {
    const usages = await findUsages(model, page.qualifiedName, serializedCache);
    const usedInNavigation = await isUsedInNavigation(model, page.qualifiedName);
    if (usages === 0 && !usedInNavigation) {
      unused.pages.push(page.qualifiedName);
      const pg = await page.load();
      pg.delete();
    }
  }
}

// Utility function to find the usage count of an item
async function findUsages(model, itemName, serializedCache) {
  let usageCount = 0;
  // Get all items (microflows, nanoflows, pages) in the model
  const allModulesNames = model.allModules().map((module) => module.name);
  for (const moduleName of allModulesNames) {
    const allItems = getItemsFromOneModule(model, moduleName);

    // Check each item for references to the item being checked
    for (const item of allItems) {
      if (item.qualifiedName === itemName) continue;
      try {
        const itemID = item.id;
        if (!serializedCache[itemID]) {
          serializedCache[itemID] = JSON.stringify(await item.load());
        }
        if (serializedCache[itemID].includes(itemName)) {
          usageCount++;
        }
      } catch (error) {
        console.error(`Error processing item ${item.qualifiedName}: ${error}`);
      }
    }
  }

  return usageCount;
}

const getItemsFromOneModule = (model, moduleName) => {
  const microflowsOfThatModule = model
    .allMicroflows()
    .filter((microflow) => microflow.qualifiedName.startsWith(moduleName + "."));
  const nanoflowsOfThatModule = model
    .allNanoflows()
    .filter((nanoflow) => nanoflow.qualifiedName.startsWith(moduleName + "."));
  const pagesOfThatModule = model.allPages().filter((page) => page.qualifiedName.startsWith(moduleName + "."));
  return [...microflowsOfThatModule, ...nanoflowsOfThatModule, ...pagesOfThatModule];
};

// Check if an item is used in navigation
async function isUsedInNavigation(model, itemName) {
  let isUsed = false;
  // Load all navigation documents and check for references to the item
  const navigationDocuments = model.allNavigationDocuments();

  for (const navDoc of navigationDocuments) {
    const navDocContent = await navDoc.load(); // Load the content of each navigation document
    // Check if the itemName is used in the navigation profiles
    const navDocString = JSON.stringify(navDocContent);
    if (navDocString.includes(itemName)) {
      isUsed = true;
      break;
    }
  }
  return isUsed;
}

main().catch(console.error);
