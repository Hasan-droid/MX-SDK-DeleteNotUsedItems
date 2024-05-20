"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mendixplatformsdk_1 = require("mendixplatformsdk");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Specify the module name within the Mendix application
        const moduleName = "MyFirstModule";
        // Initialize the Mendix SDK client
        const client = new mendixplatformsdk_1.MendixPlatformClient();
        // Connect to the Mendix app using a hidden app ID
        const app = client.getApp("9609dbc9-f6c5-4f91-bf6b-d2ce7a2308eb");
        // Create a temporary working copy of the branch use trunk or main
        const workingCopy = yield app.createTemporaryWorkingCopy("trunk");
        // Open the model for the working copy
        const model = yield workingCopy.openModel();
        // Prepare a structure to store unused items
        const unused = {
            pages: [],
            nanoflows: [],
            otherMicroflows: [],
        };
        // Cache for storing serialized data to optimize lookups
        const serializedCache = {};
        // Find unused items and log them
        try {
            yield findUnusedItems(model, moduleName, unused, serializedCache);
            console.log("Unused items found:", unused);
        }
        catch (error) {
            console.error(`An error occurred during execution: ${error}`);
        }
        // Commit changes if any unused items were found and deleted
        try {
            yield model.flushChanges();
            yield workingCopy.commitToRepository("trunk", {
                commitMessage: "Deleted unused items.",
            });
            console.log("Changes committed successfully!");
        }
        catch (error) {
            console.error(`An error occurred during execution: ${error}`);
        }
    });
}
// Main function to find unused items within a specific module
function findUnusedItems(model, moduleName, unused, serializedCache) {
    return __awaiter(this, void 0, void 0, function* () {
        yield findUnusedMicroflows(model, moduleName, unused, serializedCache);
        yield findUnusedNanoflows(model, moduleName, unused, serializedCache);
        yield findUnusedPages(model, moduleName, unused, serializedCache);
    });
}
// Find and delete unused microflows in the module
function findUnusedMicroflows(model, moduleName, unused, serializedCache) {
    return __awaiter(this, void 0, void 0, function* () {
        // Filter microflows within the specified module
        const microflowsInModule = model
            .allMicroflows()
            .filter((microflow) => microflow.qualifiedName.startsWith(moduleName + "."));
        // Check each microflow for usage and delete if unused
        for (const microflow of microflowsInModule) {
            const usages = yield findUsages(model, microflow.qualifiedName, serializedCache);
            const usedInNavigation = yield isUsedInNavigation(model, microflow.qualifiedName);
            if (usages === 0 && !usedInNavigation) {
                unused.otherMicroflows.push(microflow.qualifiedName);
                const mf = yield microflow.load();
                mf.delete();
            }
        }
    });
}
// Similar to microflows, find and delete unused nanoflows
function findUnusedNanoflows(model, moduleName, unused, serializedCache) {
    return __awaiter(this, void 0, void 0, function* () {
        // Filter nanoflows within the specified module
        const nanoflowsInModule = model
            .allNanoflows()
            .filter((nanoflow) => nanoflow.qualifiedName.startsWith(moduleName + "."));
        // Check each nanoflow for usage and delete if unused
        for (const nanoflow of nanoflowsInModule) {
            const usages = yield findUsages(model, nanoflow.qualifiedName, serializedCache);
            const usedInNavigation = yield isUsedInNavigation(model, nanoflow.qualifiedName);
            if (usages === 0 && !usedInNavigation) {
                unused.nanoflows.push(nanoflow.qualifiedName);
                const nf = yield nanoflow.load();
                nf.delete();
            }
        }
    });
}
// Similar to microflows and nanoflows, find and delete unused pages
function findUnusedPages(model, moduleName, unused, serializedCache) {
    return __awaiter(this, void 0, void 0, function* () {
        // Filter pages within the specified module
        const pagesInModule = model.allPages().filter((page) => page.qualifiedName.startsWith(moduleName + "."));
        // Check each page for usage and delete if unused
        for (const page of pagesInModule) {
            const usages = yield findUsages(model, page.qualifiedName, serializedCache);
            const usedInNavigation = yield isUsedInNavigation(model, page.qualifiedName);
            if (usages === 0 && !usedInNavigation) {
                unused.pages.push(page.qualifiedName);
                const pg = yield page.load();
                pg.delete();
            }
        }
    });
}
// Utility function to find the usage count of an item
function findUsages(model, itemName, serializedCache) {
    return __awaiter(this, void 0, void 0, function* () {
        let usageCount = 0;
        // Get all items (microflows, nanoflows, pages) in the model
        const allItems = [...model.allMicroflows(), ...model.allNanoflows(), ...model.allPages()];
        // Check each item for references to the item being checked
        for (const item of allItems) {
            if (item.qualifiedName === itemName)
                continue;
            try {
                const itemID = item.id;
                if (!serializedCache[itemID]) {
                    serializedCache[itemID] = JSON.stringify(yield item.load());
                }
                if (serializedCache[itemID].includes(itemName)) {
                    usageCount++;
                }
            }
            catch (error) {
                console.error(`Error processing item ${item.qualifiedName}: ${error}`);
            }
        }
        return usageCount;
    });
}
// Check if an item is used in navigation
function isUsedInNavigation(model, itemName) {
    return __awaiter(this, void 0, void 0, function* () {
        let isUsed = false;
        // Load all navigation documents and check for references to the item
        const navigationDocuments = model.allNavigationDocuments();
        for (const navDoc of navigationDocuments) {
            const navDocContent = yield navDoc.load(); // Load the content of each navigation document
            // Check if the itemName is used in the navigation profiles
            const navDocString = JSON.stringify(navDocContent);
            if (navDocString.includes(itemName)) {
                isUsed = true;
                break;
            }
        }
        return isUsed;
    });
}
main().catch(console.error);
//# sourceMappingURL=script.js.map