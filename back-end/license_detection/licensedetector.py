import numpy as np
from expiringdict import ExpiringDict
from openalpr import Alpr
import sys

class LicenseDetector:
	def __init__(self, runtime_data = '/usr/share/openalpr/runtime_data/'):
		self.runtime_data = runtime_data
		self.cache = ExpiringDict(max_len=100, max_age_seconds=5)
		self.init_alpr()

	def license_detect(self, image):

		results = self.alpr.recognize_ndarray(image)
		i = 0
		for plate in results['results']:
			for candidate in plate['candidates']:
				if 90 <= candidate['confidence']:
					self.cache[candidate['plate']] = self.cache.get(candidate['plate'], 0) + 1
		sort_orders = sorted(self.cache.items(), key=lambda itm: itm[1], reverse=True)
		return (sort_orders[0][0] if sort_orders else None)
	
	def init_alpr(self):
		self.alpr = Alpr("us", "/etc/openalpr/openalpr.conf", self.runtime_data)
		if not self.alpr.is_loaded():
			print("Error loading OpenALPR")
			sys.exit(1)
    
		self.alpr.set_top_n(20)
		self.alpr.set_default_region("md")


