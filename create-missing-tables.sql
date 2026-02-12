-- Create missing Project Genesis tables
CREATE TABLE IF NOT EXISTS `project_genesis_phases` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `projectId` INT NOT NULL,
  `phaseNumber` INT NOT NULL,
  `phaseName` VARCHAR(255) NOT NULL,
  `status` ENUM('not_started', 'in_progress', 'completed', 'blocked') DEFAULT 'not_started',
  `startedAt` TIMESTAMP NULL,
  `completedAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`projectId`) REFERENCES `project_genesis`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `project_genesis_milestones` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `projectId` INT NOT NULL,
  `phaseId` INT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `status` ENUM('pending', 'in_progress', 'completed', 'blocked') DEFAULT 'pending',
  `dueDate` DATE NULL,
  `completedAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`projectId`) REFERENCES `project_genesis`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`phaseId`) REFERENCES `project_genesis_phases`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `project_genesis_deliverables` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `projectId` INT NOT NULL,
  `phaseId` INT NULL,
  `milestoneId` INT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `type` VARCHAR(100) NULL,
  `status` ENUM('pending', 'in_progress', 'completed', 'approved', 'rejected') DEFAULT 'pending',
  `fileUrl` TEXT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`projectId`) REFERENCES `project_genesis`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`phaseId`) REFERENCES `project_genesis_phases`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`milestoneId`) REFERENCES `project_genesis_milestones`(`id`) ON DELETE SET NULL
);
