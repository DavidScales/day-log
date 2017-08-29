const logContainer = document.getElementById('log-container');
const addLogButton = document.getElementById('add-log-button');
const logNote = document.getElementById('log-note');

function addLog(e) {
  e.preventDefault();
  const log = {
    timeStamp: Date.now(),
    note: logNote.value
  };
  showLogs([log]);
  saveLogs([log]);
}

function formattedDate(timeStamp) {
  const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = new Date(timeStamp);
  let dd = date.getDate();
  dd = (dd < 10) ? '0' + dd : dd;
  const ddd = days[date.getDay()];
  const mmm = months[date.getMonth()];
  return `${ddd} ${mmm} ${dd}`;
}

function showLogs(logs) {
  logs.forEach(log => {
    const date = formattedDate(log.timeStamp);
    const logItem = document.createElement('li');
    const logContent = [
      `<p><strong>${date}</strong></p>`,
      `<p>${log.note}</p>`
    ].join('\n');
    logItem.innerHTML = logContent;
    logContainer.appendChild(logItem);
  });
}

function createIndexedDB() {
  if (!('indexedDB' in window)) {return null;}
  return idb.open('day-logs', 1, function(upgradeDb) {
    if (!upgradeDb.objectStoreNames.contains('logs')) {
      const logsOS = upgradeDb.createObjectStore('logs', {keyPath: 'timeStamp'});
    }
  });
}

function saveLogs(logs) {
  if (!('indexedDB' in window)) {return null;}
  return dbPromise.then(db => {
    const tx = db.transaction('logs', 'readwrite');
    const store = tx.objectStore('logs');
    return Promise.all(logs.map(log => store.put(log)))
    .catch((err) => {
      console.warn('Aborting transaction\n', err);
      return tx.abort();
    });
  });
}

function getLogs() {
  if (!('indexedDB' in window)) {return null;}
  return dbPromise.then(db => {
    const tx = db.transaction('logs', 'readonly');
    const store = tx.objectStore('logs');
    return store.getAll();
  });
}

addLogButton.addEventListener('click', addLog);

const dbPromise = createIndexedDB();

getLogs()
.then(logs => {
  if (!logs.length) {console.log('No logs');}
  showLogs(logs);
}).catch(err => {
  console.warn(err);
});
