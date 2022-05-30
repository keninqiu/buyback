const fs = require('fs');
const fab = require('./services/fab');
const util = require('./services/util');
const secret = require('./services/secret.json');

const main = function() {
    const { 
        privateKey, address
    } = fab.getWalletIdentity(secret.mnemonic_airdrop);

    fs.readFile('./csv/updatedFilteredUTXOS.csv', 'utf8', async (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        const rows = data.split('\n');
        for(let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const cols = row.split(',');
            if(cols && cols.length !== 2) {
                continue;
            }
            const toAddress = cols[0];
            const value = Number(cols[1]);
            
            
            const ret = await fab.sendTransaction(privateKey, address, toAddress, 18, 'FAB', 'edcbad387def0b51eeaf41351ed158a4ed54a297', 0, value, {}, true);
            if(!ret || !ret.txHash) {
                i --;
                await util.delay(60 * 5);
                continue;
            } else {
                
                data = data.replace(row, row + ',' + ret.txHash);
                fs.writeFile('./csv/updatedFilteredUTXOS.csv', data, err => {
                    if (err) {
                      console.error(err);
                    }
                    console.log('wrote row ' + i + ' successfully');
                });  
                await util.delay(5);              
            }
        }

        console.log('all done');
        process.exit();
    });
}

main();