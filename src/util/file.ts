import { PathLike, unlink } from "fs";

export const deleteFile = (filePath: PathLike) => {
  unlink(filePath, (err) => {
    if (err) {
      throw err;
    }
  });
};
