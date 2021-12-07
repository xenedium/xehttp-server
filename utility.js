import fs from 'fs';

const __dirname = process.cwd();
export const __rootDir = `${__dirname}/public`;

export function PathExist(reqUrl) {
    return fs.existsSync(__rootDir + reqUrl);
}

export function IsDir(reqUrl){
    return fs.lstatSync(__rootDir + reqUrl).isDirectory();
}

export function EnumDir(reqUrl){

    if (!reqUrl.endsWith('/')) reqUrl += '/';
    const items = [];
    fs.readdirSync(__rootDir + reqUrl).forEach( item => {
        if (fs.lstatSync(__rootDir + reqUrl + item).isDirectory()) items.push(item + '/');
        else items.push(item);
    })
    return items;
}

function ItemToPermissionsString(item, reqUrl){
    const itemStat = fs.lstatSync(__rootDir + reqUrl + item);
    let permissions = '(';

    if (itemStat.isDirectory()) permissions += 'd';
    else permissions += '-';

    permissions += (itemStat.mode & 0o100) ? 'r' : '-';
    permissions += (itemStat.mode & 0o010) ? 'w' : '-';
    permissions += (itemStat.mode & 0o001) ? 'x' : '-';

    permissions += (itemStat.mode & 0o000100) ? 'r' : '-';
    permissions += (itemStat.mode & 0o000010) ? 'w' : '-';
    permissions += (itemStat.mode & 0o000001) ? 'x' : '-';
    
    permissions += (itemStat.mode & 0o000000100) ? 'r' : '-';
    permissions += (itemStat.mode & 0o000000020) ? 'w' : '-';
    permissions += (itemStat.mode & 0o000000003) ? 'x' : '-';

    permissions += ')';

    return permissions;
}

function ItemToSizeString(item, reqUrl) {

    const stat = fs.lstatSync(__rootDir + reqUrl + item);

    if (stat.isDirectory && stat.isDirectory()) {
        return '';
      }
    
      let bytes = stat.size;
    
      if (bytes < 1024) {
        return `${bytes}B`;
      }
    
      const units = ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
      let u = -1;
      do {
        bytes /= 1024;
        u += 1;
      } while (bytes >= 1024);
    
      let b = bytes.toFixed(1);
      if (isNaN(b)) b = '??';
    
      return b + units[u];
}

function ItemToDateString(item, reqUrl){
    const stat = fs.lstatSync(__rootDir + reqUrl + item);
    const t = new Date(stat.mtime);
    return (('0' + (t.getDate())).slice(-2) + '-' +
          t.toLocaleString('default', { month: 'short' }) + '-' +
          t.getFullYear() + ' ' +
          ('0' + t.getHours()).slice(-2) + ':' +
          ('0' + t.getMinutes()).slice(-2));
}

export function ParseToHtml(arrItems, reqUrl){
    var html = `<!DOCTYPE html> \
                    <html lang="en"> \
                        <head> \
                            <meta charset="UTF-8"> \
                            <meta http-equiv="X-UA-Compatible" content="IE=edge"> \
                            <meta name="viewport" content="width=device-width, initial-scale=1.0"> \
                            <script src="index.js"></script> \
                            <title>Index of: ${reqUrl.replace('/', '')}</title> \
                        </head> \
                        <body> \
                            <div id="mainTitle"><h1>Index of: ${reqUrl}</h1></div> \
                            <div id="mainTable"><table> \
                        `
    
    arrItems.forEach( item => {
        html += `<tr>\
                    <td class="perms"><code>${ItemToPermissionsString(item, reqUrl)}</code></td> \
                    <td class="time">${ItemToDateString(item, reqUrl)}</td> \
                    <td class="size"><code>${ItemToSizeString(item, reqUrl)}</code></td> \
                    <td class="name"><a class="${item.endsWith('/') ? 'link-directory' : 'link-file'}" href="${reqUrl}${item}">${item}</a></td> \
                </tr>`

    })

    html += `</table></div></body></html>`;
    return html;
}
