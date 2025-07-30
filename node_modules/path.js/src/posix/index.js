import { Path } from '../path';

/**
 * A subclass of `Path` that provides functionality specific to POSIX-compliant
 * systems (e.g., Linux, macOS).
 *
 */
export class PosixPath extends Path {
  constructor() {
    super()
  }
  /**
   * Retrieves the current working directory by calling `process.cwd()`.
   *
   * @memberof PosixPath
   * @instance
   * @returns {string} - The current working directory as returned by `process.cwd()`.
   */
  cwd() {
    return process.cwd();
  }
}

export default PosixPath;
