import { catchAsyncError } from "../middlewear/cashAsyncErrors.js";
import ErrorHandler from "../middlewear/error.js";
import { Project } from "../models/projectSchema.js";
import { v2 as cloudinary } from "cloudinary";

export const addNewProject = catchAsyncError(async (req, res, next) => {
  // Check if files are uploaded
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Project Banner Image Required", 400));
  }
  
  const { projectBanner } = req.files;
  const {
    title,
    description,
    gitRepoLink,
    projectLink,
    technologies, // ✅ FIXED: Corrected spelling
    stack,
    deployed,
  } = req.body;

  // Debug: Log received data
  console.log("Received body:", req.body);
  console.log("Received files:", req.files);

  // Validation with detailed error messages
  const missingFields = [];
  if (!title) missingFields.push("title");
  if (!description) missingFields.push("description");
  if (!gitRepoLink) missingFields.push("gitRepoLink");
  if (!projectLink) missingFields.push("projectLink");
  if (!technologies) missingFields.push("technologies"); // ✅ FIXED: Corrected spelling
  if (!stack) missingFields.push("stack");
  if (!deployed) missingFields.push("deployed");

  if (missingFields.length > 0) {
    return next(new ErrorHandler(`Missing required fields: ${missingFields.join(", ")}`, 400));
  }

  try {
    // Upload to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(
      projectBanner.tempFilePath,
      { folder: "PROJECT-IMAGES" }
    );

    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error("Cloudinary Error: ", cloudinaryResponse.error || "Unknown Cloudinary Error");
      return next(new ErrorHandler("Failed to upload project banner to Cloudinary.", 500));
    }

    // Create project
    const project = await Project.create({
      title,
      description,
      gitRepoLink,
      projectLink,
      technologies, // ✅ FIXED: Corrected spelling
      stack,
      deployed,
      projectBanner: {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      },
    });

    res.status(201).json({
      success: true,
      message: "New Project Added Successfully",
      project,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return next(new ErrorHandler("Failed to create project", 500));
  }
});

export const updateProject = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  
  // Check if project exists
  const existingProject = await Project.findById(id);
  if (!existingProject) {
    return next(new ErrorHandler("Project Not Found", 404));
  }

  const newProjectData = {
    title: req.body.title,
    description: req.body.description,
    gitRepoLink: req.body.gitRepoLink,
    projectLink: req.body.projectLink,
    technologies: req.body.technologies, // ✅ FIXED: Corrected spelling
    stack: req.body.stack,
    deployed: req.body.deployed,
  };

  // Handle file upload if new banner is provided
  if (req.files && req.files.projectBanner) {
    try {
      const projectBanner = req.files.projectBanner;
      
      // Delete old image from Cloudinary
      if (existingProject.projectBanner && existingProject.projectBanner.public_id) {
        await cloudinary.uploader.destroy(existingProject.projectBanner.public_id);
      }

      // Upload new image
      const cloudinaryResponse = await cloudinary.uploader.upload(
        projectBanner.tempFilePath,
        { folder: "PROJECT-IMAGES" }
      );

      if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error("Cloudinary Error: ", cloudinaryResponse.error);
        return next(new ErrorHandler("Failed to upload new project banner", 500));
      }

      newProjectData.projectBanner = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      };
    } catch (error) {
      console.error("Error updating project banner:", error);
      return next(new ErrorHandler("Failed to update project banner", 500));
    }
  }

  try {
    const project = await Project.findByIdAndUpdate(id, newProjectData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
      message: "Project Updated Successfully",
      project,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return next(new ErrorHandler("Failed to update project", 500));
  }
});

export const deleteProject = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const project = await Project.findById(id);
  
  if (!project) {
    return next(new ErrorHandler("Project Not Found", 404)); // ✅ FIXED: Typo in error message
  }

  // Delete image from Cloudinary
  if (project.projectBanner && project.projectBanner.public_id) {
    try {
      await cloudinary.uploader.destroy(project.projectBanner.public_id);
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
      // Continue with project deletion even if image deletion fails
    }
  }

  await project.deleteOne();
  
  res.status(200).json({
    success: true,
    message: "Project Deleted Successfully!",
  });
});

export const getAllProject = catchAsyncError(async (req, res, next) => {
  const projects = await Project.find();
  res.status(200).json({
    success: true,
    projects,
  });
});

export const getSingleProject = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const project = await Project.findById(id);
  
  if (!project) {
    return next(new ErrorHandler("Project Not Found!", 404));
  }
  
  res.status(200).json({
    success: true,
    project,
  });
});