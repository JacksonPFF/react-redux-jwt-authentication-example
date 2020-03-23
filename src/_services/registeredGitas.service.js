const axios = require('axios');
const _ = require('lodash');

import config from 'config';
import { authHeader, errorHandler } from '../_helpers';
import { 
  endpointConstants,
  serialConstants,
} from '../_constants';

export const registeredGitasService = {
  getAllRegistered
};

function getAll(endpoint) {
  const requestOptions = {
    url: `${config.apiUrl}` + endpoint,
    method: 'GET',
    headers: authHeader()
  };

  return axios(requestOptions)
}

function getAllRegistered() {
  const users = getAll(endpointConstants.USER_ENDPOINT);
  const gitas = getAll(endpointConstants.GITA_ENDPOINT);
  const registrations = getAll(endpointConstants.REGISTRATION_ENDPOINT);

  return axios.all([users, gitas, registrations]).then(axios.spread((...responses) => {
    const users = responses[0].data;
    const gitas = responses[1].data;
    const registrations = responses[2].data;
    //const data = gitas.data;
    let output = findRegsiteredGitas(users, gitas, registrations);

    return output;

    })).catch(error => errorHandler(error));
}

function findRegsiteredGitas(users, gitas, registrations){
  let output = [];
  registrations.forEach(element => { 
    if (element["active"]) {
      var registered_gita = _.find(gitas, ['id', element["gita"]]);
      if (isSerialLegit(registered_gita["serial"])) {
        var registered_user = _.find(users, ['id', element["user"]]);
        output.push({
          "serial": registered_gita["serial"].slice(-5),
          "output": {
                      "serial": registered_gita["serial"],
                      "name": registered_gita["name"],
                      "registeredByUsername": registered_user["username"],
                      "registeredByEmail": registered_user["email"],
                      "created": element["created"],
                    },
          "csv_output": "s" + registered_gita["serial"] + "," + registered_gita["name"] + "," + registered_user["username"] + "," + registered_user["email"] + "," + element["created"] + "\n"
        });
      }
    }
  });
  output = _.orderBy(output, ['serial'],['asc']);
  return output 
}

function isSerialLegit(serial){
  if (serial.startsWith("99")) {
    return false 
  }

  if (serialConstants.TEST_SERIALS.includes(serial)) {
    return false
  }

  // if args.filter == "none":
  //   return True
  
  if (serialConstants.OLD_TOUR_SERIALS.includes(serial)) {
    return false
  }

  // if args.filter == "old-tour":
  //   return True

  if (serialConstants.FILTER_SERIALS.includes(serial)) {
    return false
  }

  return true
}