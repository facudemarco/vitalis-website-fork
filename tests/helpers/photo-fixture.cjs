const zlib = require('node:zlib');
// Four colored corners make cropping/stretching visible in PDF QA, without patient data.
function photoFixture(width, height) {
  const crc = data => {
    let value = -1;
    for (const byte of data) {
      value ^= byte;
      for (let bit=0;bit<8;bit++) value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
    }
    return (value ^ -1) >>> 0;
  };
  const chunk = (type,data) => {
    const tag=Buffer.from(type), size=Buffer.alloc(4), check=Buffer.alloc(4);
    size.writeUInt32BE(data.length);check.writeUInt32BE(crc(Buffer.concat([tag,data])));
    return Buffer.concat([size,tag,data,check]);
  };
  const header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=8;header[9]=2;
  const pixels=Buffer.alloc((width*3+1)*height);
  for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
    const color=y<height/2 ? (x<width/2?[240,50,50]:[50,180,50]) : (x<width/2?[50,80,240]:[240,190,40]);
    const offset=y*(width*3+1)+1+x*3;
    pixels.set(color,offset);
  }
  return 'data:image/png;base64,'+Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]).toString('base64');
}
module.exports={photoFixture};
