const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const os = require('os');

/**
 * Configuration Manager for ViraPilot
 * Handles secure local file storage for settings and API keys
 */
class ConfigManager {
  constructor() {
    // Use user home directory for config storage
    this.configDir = path.join(os.homedir(), '.virapilot');
    this.ensureConfigDir();
  }

  /**
   * Ensure config directory exists
   */
  ensureConfigDir() {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
      console.log('Created config directory:', this.configDir);
    }
  }

  /**
   * Get full path for a config file
   */
  getConfigPath(filename) {
    return path.join(this.configDir, filename);
  }

  /**
   * Read a config file
   */
  readConfigFile(filename) {
    try {
      const filepath = this.getConfigPath(filename);
      if (fs.existsSync(filepath)) {
        return fs.readFileSync(filepath, 'utf-8');
      }
      return null;
    } catch (error) {
      console.error('Error reading config file:', filename, error);
      return null;
    }
  }

  /**
   * Write a config file
   */
  writeConfigFile(filename, content) {
    try {
      const filepath = this.getConfigPath(filename);
      fs.writeFileSync(filepath, content, 'utf-8');
      console.log('Config file saved:', filename);
      return true;
    } catch (error) {
      console.error('Error writing config file:', filename, error);
      return false;
    }
  }

  /**
   * Delete a config file
   */
  deleteFile(filename) {
    try {
      const filepath = this.getConfigPath(filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.log('Config file deleted:', filename);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting config file:', filename, error);
      return false;
    }
  }

  /**
   * Read arbitrary file (for import/export)
   */
  readFile(filepath) {
    try {
      if (fs.existsSync(filepath)) {
        return fs.readFileSync(filepath, 'utf-8');
      }
      return null;
    } catch (error) {
      console.error('Error reading file:', filepath, error);
      return null;
    }
  }

  /**
   * Write arbitrary file (for import/export)
   */
  writeFile(filepath, content) {
    try {
      fs.writeFileSync(filepath, content, 'utf-8');
      return true;
    } catch (error) {
      console.error('Error writing file:', filepath, error);
      return false;
    }
  }

  /**
   * List all config files
   */
  listConfigFiles() {
    try {
      return fs.readdirSync(this.configDir);
    } catch (error) {
      console.error('Error listing config files:', error);
      return [];
    }
  }

  /**
   * Get config directory path
   */
  getConfigDirectory() {
    return this.configDir;
  }
}

module.exports = new ConfigManager();
