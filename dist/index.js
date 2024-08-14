"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyResourcesToRoot = copyResourcesToRoot;
const node_path_1 = __importDefault(require("node:path"));
const node_process_1 = __importDefault(require("node:process"));
const fs_extra_1 = __importDefault(require("fs-extra"));
async function copyResourcesToRoot(options) {
    const isProjectResourcesExists = await _isProjectResourcesExists(options);
    const isGoogleServiceExists = await _isGoogleServiceExists(options);
    await _copyProjectFilesToRoot(options);
    if (!isProjectResourcesExists) {
        console.warn('-> project resources not found, default resources will be used');
        await _copyDefaultResourcesToRoot();
    }
    if (!isGoogleServiceExists) {
        console.warn('-> google services not found, push notifications wont work');
    }
}
async function _isProjectResourcesExists(options) {
    const { environment, project } = options;
    const resourcesPath = node_path_1.default.join(node_process_1.default.cwd(), `config/${environment}/${project}/resources`);
    return new Promise((resolve, _reject) => {
        resolve(fs_extra_1.default.pathExistsSync(resourcesPath));
    });
}
async function _isGoogleServiceExists(options) {
    const { environment, project } = options;
    const serviceJson = node_path_1.default.join(node_process_1.default.cwd(), `config/${environment}/${project}/google-services.json`);
    const servicePlist = node_path_1.default.join(node_process_1.default.cwd(), `config/${environment}/${project}/GoogleService-Info.plist`);
    return new Promise((resolve, _reject) => {
        resolve(fs_extra_1.default.pathExistsSync(serviceJson) && fs_extra_1.default.pathExistsSync(servicePlist));
    });
}
async function _copyProjectFilesToRoot(options) {
    const { environment, project } = options;
    const copyFromPath = node_path_1.default.join(node_process_1.default.cwd(), `config/${environment}/${project}`);
    const copyToPath = node_path_1.default.join(node_process_1.default.cwd());
    return new Promise((resolve, reject) => {
        if (!fs_extra_1.default.existsSync(copyFromPath))
            reject(_createFileNotExistsError(copyFromPath));
        fs_extra_1.default.copySync(copyFromPath, copyToPath);
        // eslint-disable-next-line no-console
        console.log('-> project files copied to root');
        resolve();
    });
}
async function _copyDefaultResourcesToRoot() {
    const copyFromPath = node_path_1.default.join(node_process_1.default.cwd(), `default/resources`);
    const copyToPath = node_path_1.default.join(node_process_1.default.cwd(), `resources`);
    return new Promise((resolve, reject) => {
        if (!fs_extra_1.default.existsSync(copyFromPath))
            reject(_createFileNotExistsError(copyFromPath));
        fs_extra_1.default.copySync(copyFromPath, copyToPath);
        // eslint-disable-next-line no-console
        console.log('-> default resources copied to root');
        resolve();
    });
}
function _createFileNotExistsError(filePath) {
    return `[${filePath}] is not exists`;
}
