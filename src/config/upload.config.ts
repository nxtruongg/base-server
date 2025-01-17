import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const MulterConfig = {
  storage: diskStorage({
    destination: './uploads',

    filename(req, file, callback) {
      const fileName: string = uuidv4();
      const ext: string = path.extname(file.originalname);
      callback(null, `${fileName}${ext}`);
    },
  }),
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (
      file.mimetype.match(
        /(image\/jpeg|image\/png|application\/pdf|video\/mp4)/,
      )
    ) {
      callback(null, true);
    } else {
      callback(new Error('Unsupported file type'), false);
    }
  },
};
