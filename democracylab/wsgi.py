"""
WSGI config for democracylab project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/howto/deployment/wsgi/
"""

import os

from common.helpers.filesystem import touch
from django.core.wsgi import get_wsgi_application
from whitenoise.django import DjangoWhiteNoise

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "democracylab.settings")

application = get_wsgi_application()
application = DjangoWhiteNoise(application)

if os.environ.get('DYNO', None) is not None:
    print('Touching /tmp/app-initialized')
    touch('/tmp/app-initialized')

