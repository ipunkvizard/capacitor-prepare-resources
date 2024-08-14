import path from 'node:path'
import process from 'node:process'
import fse from 'fs-extra'

interface CommandOptions {
  environment?: string
  project?: string
}

export async function copyResourcesToRoot(options: CommandOptions) {
  const isProjectResourcesExists = await _isProjectResourcesExists(options)
  const isGoogleServiceExists = await _isGoogleServiceExists(options)

  await _copyProjectFilesToRoot(options)

  if (!isProjectResourcesExists) {
    console.warn('-> project resources not found, default resources will be used')
    await _copyDefaultResourcesToRoot()
  }

  if (!isGoogleServiceExists) {
    console.warn('-> google services not found, push notifications wont work')
  }
}

async function _isProjectResourcesExists(options: CommandOptions) {
  const { environment, project } = options
  const resourcesPath = path.join(process.cwd(), `config/${environment}/${project}/resources`)

  return new Promise((resolve, _reject) => {
    resolve(fse.pathExistsSync(resourcesPath))
  })
}

async function _isGoogleServiceExists(options: CommandOptions) {
  const { environment, project } = options
  const serviceJson = path.join(process.cwd(), `config/${environment}/${project}/google-services.json`)
  const servicePlist = path.join(process.cwd(), `config/${environment}/${project}/GoogleService-Info.plist`)

  return new Promise((resolve, _reject) => {
    resolve(fse.pathExistsSync(serviceJson) && fse.pathExistsSync(servicePlist))
  })
}

async function _copyProjectFilesToRoot(options: CommandOptions) {
  const { environment, project } = options
  const copyFromPath = path.join(process.cwd(), `config/${environment}/${project}`)
  const copyToPath = path.join(process.cwd())

  return new Promise<void>((resolve, reject) => {
    if (!fse.existsSync(copyFromPath))
      reject(_createFileNotExistsError(copyFromPath))

    fse.copySync(copyFromPath, copyToPath)
    // eslint-disable-next-line no-console
    console.log('-> project files copied to root')
    resolve()
  })
}

async function _copyDefaultResourcesToRoot() {
  const copyFromPath = path.join(process.cwd(), `default/resources`)
  const copyToPath = path.join(process.cwd(), `resources`)

  return new Promise<void>((resolve, reject) => {
    if (!fse.existsSync(copyFromPath))
      reject(_createFileNotExistsError(copyFromPath))

    fse.copySync(copyFromPath, copyToPath)
    // eslint-disable-next-line no-console
    console.log('-> default resources copied to root')
    resolve()
  })
}

function _createFileNotExistsError(filePath: string) {
  return `[${filePath}] is not exists`
}
