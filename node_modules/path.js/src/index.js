import { WinPath } from './win'
import { PosixPath } from './posix'

const isWindows = WinPath.isWindows;
const win32 = new WinPath;
const posix = new PosixPath;
const path = isWindows ? win32 : posix;
path.win32 = win32
path.posix = posix

export default path
export * from './path'
export * from './win'
export * from './posix'
