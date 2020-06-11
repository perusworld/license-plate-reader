import datetime
import math
from .apilogger import APILogger

EXITED = 'EXITED'
PARKED = 'PARKED'
class ActivityLogger:
	def __init__(self, noise, location, endpoint):
		self.noise = noise
		self.clear()
		self.api_log = APILogger(endpoint, location)

	def clear(self):
		self.activity_log = []
		self.license = None

	def add_activity_log(self, license, where):
		self.activity_log.append({
			'activity': PARKED,
			'updated': datetime.datetime.now(),
			'license': license,
			'where': where,
			'duration': None
		})

	def close_activity_log(self):
		current = self.activity_log[-1]
		if EXITED != current['activity']:
			duration = math.floor((datetime.datetime.now() - current['updated']).total_seconds())
			if self.noise < duration:
				self.activity_log.append({
					'activity': EXITED,
					'updated': datetime.datetime.now(),
					'license': current['license'],
					'where': current['where'],
					'duration': duration
				})
				try:
					self.api_log.send_request(current['license'], current['where'], duration)
				except:
					print("An exception occurred while calling api")
			else:
				print(f'Looks like noise removing it')
				self.activity_log.pop()

	def update_activity_log(self, license, where):
		self.license = license
		if license is None:
			if 0 != len(self.activity_log):
				self.close_activity_log()
		else:
			if 0 == len(self.activity_log):
				self.add_activity_log(license, where)
			else:
				current = self.activity_log[-1]
				if (license != current['license']):
					self.close_activity_log()
					self.add_activity_log(license, where)
				elif EXITED == current['activity']:
					self.add_activity_log(license, where)


