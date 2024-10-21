self.addEventListener('push', function (event) {
    const options = {
      body: event.data.text(),
      icon: 'path-to-your-notification-icon.png',
    };
  
    event.waitUntil(
      self.registration.showNotification('Push Notification', options)
    );
  });