import requests

class APILogger:
	def __init__(self, endpoint, location):
		self.endpoint = endpoint
		self.location = location

	def submit_call(self, req):
		if '' == self.endpoint:
			print('Skipping api log')
			return {}
		else:
			return requests.post(self.endpoint, json=req).json()

	def send_request(self, license, where, amount):
		return self.submit_call({
			"license":license,
			"location": self.location,
			"where": where,
			"amount": amount
		})

