const fs = require('fs');
const { default: BigNumber } = require('bignumber.js');

const main = function() {

    fs.readFile('./csv/filteredUTXOS.csv', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        const rows = data.split('\n');
        let sum = new BigNumber(0);
        const uniqueAddresses = rows.reduce((acc, v, index) => {
            if(index == 0) {
                return acc;
            }
            const cols = v.split(',');
            const address = cols[4];
            const value = cols[1];
            
            const valueBig = new BigNumber(value).shiftedBy(-8);
            sum = sum.plus(valueBig);
            if (acc[address] === void 0) acc[address] = valueBig;
            else acc[address] = acc[address].plus(valueBig);
            return acc;
        }, {});

        /*
        console.log('uniqueAddresses===', uniqueAddresses);
        console.log('Object.keys(obj).length=', Object.keys(uniqueAddresses).length);

        console.log('sum=', sum.toNumber());
        */

        let updated = '';
        const keys = Object.keys(uniqueAddresses);
        for(let i = 0; i < keys.length; i++) {
            const address = keys[i];
            const value = uniqueAddresses[address].toNumber();
            if(value < 1) {
                continue;
            }
            updated += (address + ',' + value);
            if(i < keys.length - 1) {
                updated += '\n';
            }
        }

        fs.writeFile('./csv/updatedFilteredUTXOS.csv', updated, err => {
            if (err) {
              console.error(err);
            }
            console.log('wrote successfully');
        });
    });
}

main();