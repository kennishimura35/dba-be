const { S3 } = require("aws-sdk");
const archiver = require("archiver");
const { PassThrough } = require("stream");

class S3Util {
  static uploadMultipleFile = async (files) => {
    const s3 = new S3();

    const params = files.map((file) => {
      // console.log(file)
      return {
        Bucket: process.env.AWS_BUCKET_NAME, // nama s3 bucket
        Key: file.filePath, // nama file (bisa juga ada folder nya)
        Body: file.buffer, // buffer object dari file di memory nodejs untuk dikirimkan
        ContentType: file.mimetype,
      };
    });

    return await Promise.all(params.map((param) => s3.upload(param).promise()));
  };

  static SingleFilesStream = (path, result) => {
    const s3 = new S3();
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: path,
    };
    s3.headObject(params, (err, data) => {
      if (err) {
        return result(err, null);
      }
      s3.getObject(params, (err, fileContents) => {
        if (err) {
          return result(err, null);
        } else {
          // Read the file
          var contents = fileContents.Body;
          return result(null, contents);
        }
      });
    });
  };

  static emptyS3Directory = async (dir) => {
    const s3 = new S3();

    const listParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: dir,
    };

    const listedObjects = await s3.listObjectsV2(listParams).promise();

    if (listedObjects.Contents.length === 0) return;

    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Delete: { Objects: [] },
    };

    listedObjects.Contents.forEach(({ Key }) => {
      deleteParams.Delete.Objects.push({ Key });
    });

    await s3.deleteObjects(deleteParams).promise();

    if (listedObjects.IsTruncated) await S3Util.deleteS3Directory(dir);
  };

  static MultiFilesStream = async (infos, result) => {
    const s3bucket = new S3();

    const objects = [];

    for (let i = 0; i < infos.length; i += 1) {
      const obj = await s3bucket
        .getObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: infos[i].filePath,
        })
        .promise();

      objects.push({
        fileName: infos[i].filePath.split("/")[2],
        lampiranId: infos[i].lampiranId,
        buffer: obj.Body,
      });
    }

    return result(null, objects);
  };
}

module.exports = { S3Util };
