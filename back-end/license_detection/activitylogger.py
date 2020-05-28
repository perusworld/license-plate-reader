import datetime
import math

EXITED = 'EXITED'
PARKED = 'PARKED'
class ActivityLogger:
	def __init__(self):
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
			self.activity_log.append({
				'activity': EXITED,
				'updated': datetime.datetime.now(),
				'license': current['license'],
				'where': current['where'],
				'duration': math.floor((datetime.datetime.now() - current['updated']).total_seconds())
			})

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


