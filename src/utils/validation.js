import { all } from "axios";
import {AppError} from "./errorHandler";

//validate uploaded file
export const validateFile = (file,maxSizeMB = 5) => {
    const errors = [];
    if(!file){
        errors.push("No fil provided");
        return {valid:false,errors};
    }
    //size validation
    const maxSize = maxSizeMB * 1024 * 1024;
    if(file.size > maxSize){
        errors.push("File is empty");
    }
    //type validation
    const allowedTypes = [
        'text/csv',
        'application/json',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
    ];
    const allowedExtensions = ['.csv','.json','.xlsx','.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)){
        errors.push(`Invalid file type.Allowed: CSV, JSON, Excel but got: ${fileExtension}`);
    }
    //Name validation
    if(file.name.length > 255){
        errors.push("File name too long(max 255 characters");
    }
    //check for suspicious charcaters in filename
    const suspiciousChars = /[<>:"|?*\x00-\x1f]/;
    if(suspiciousChars.test(file.name)){
        errors.push("Filename contains invalid characters");
    }

    return{
        valid:errors.length === 0,
        errors
    };
};

//validate csv data structure
export const validateCSVData = (data) => {
    if(!Array.isArray(data)){
        throw new AppError("Data must be an array",400,"VALIDATION_ERROR");
    }
    if(data.length === 0){
        throw new AppError("CSV file is empty",400,"VALIDATION_ERROR");
    }
    //check for inconsistent columns
    const firstRowKeys = Object.keys(data[0] || {});
    if(firstRowKeys.length === 0){
        throw new AppError("CSV has no columns",400,"VALIDATION_ERROR");
    }
    //check for empty headers
    const emptyHeaders = firstRowKeys.filter(key => !key || key.trim() === "")
    if(emptyHeaders.length > 0){
        throw new AppError("CSV contains empty column headers",400,"VALIADTION_ERROR");
    }
    //warn about inconsistent columns
    const hasconsistentcolumns = data.every(row => Object.keys(row).length === firstRowKeys.length);
    if(!hasconsistentcolumns){
        console.warn("Warning:Inconsistent column count across rows");
    }
    //check for duplicate headers
    const duplicateHeaders = firstRowKeys.filter((item,index) => 
        firstRowKeys.indexOf(item) !== index);
    if(duplicateHeaders.length > 0){
        throw new AppError(`Duplicate column headers found: ${duplicateHeaders.join(',')}`,400,"VALIDATION_ERROR");
    }
    return true;
};

export const validateJSONData = (data) => {
    if(typeof data !== "object" || data === null){
        throw new AppError("JSON must be an object or array",400,"VALIDATION_ERROR");
    }
    const dataArray = Array.isArray(data) ? data : (data.data || []);
    if(!Array.isArray(dataArray)){
        throw new AppError("JSON must contain an array or have a 'data' properly with an array",400,"VALIDATION_ERROR");
    }
    if(dataArray.length === 0){
        throw new AppError("JSON data is empty",400,"VALIDATION_ERROR");
    }
    return true;
};

export const sanitizeInput = (input,type="text") => {
    if(typeof input !== "string") return input;
    //remove leading/trailing whitespace
    let sanitized = input.trim();
    switch (type){
        case "email": //basic email validation
            sanitized = sanitized.toLowerCase();
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return emailRegex.test(sanitized) ? sanitized : '';
        case 'name':// Allow letters, spaces, hyphens, apostrophes
            sanitized = sanitized.replace(/[^a-zA-Z\s\-']/g, '');
            return sanitized.substring(0, 100);
        case 'location':// Allow letters, spaces, commas, hyphens, numbers
            sanitized = sanitized.replace(/[^a-zA-Z0-9\s,\-]/g, '');
            return sanitized.substring(0, 150);
        case 'city':// Similar to location but more strict
            sanitized = sanitized.replace(/[^a-zA-Z\s\-]/g, '');
            return sanitized.substring(0, 100);
        case 'text':
        default:// Remove HTML tags and dangerous characters
            sanitized = sanitized.replace(/<[^>]*>/g, '');
            sanitized = sanitized.replace(/[<>]/g, '');
            return sanitized.substring(0, 500);   
    }
};

export const validateAPIResponse = (response,requiredFields = []) => {
    if(!response || typeof response !== "Object"){
        throw new AppError("Invalid API response",500,"API_ERROR");
    }
    for (const field of requiredFields){
        if(!field in response){
            throw new AppError(`Missing required field: ${field}`,500,"API_ERROR");
        }
    }
    return true;
};