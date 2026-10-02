import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    //cb(null, file.fieldname + '-' + uniqueSuffix)
    cb(null, file.originalname) // we can use original name of the file as the filename in the temp folder, but it is not recommended because if two files with same name are uploaded at the same time, then the second file will overwrite the first file and we will lose the first file, so it is better to use unique name for the file in the temp folder, but for now we can use original name of the file as the filename in the temp folder
  }
})

export const upload = multer({ storage: storage })