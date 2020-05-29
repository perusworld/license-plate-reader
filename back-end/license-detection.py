from license_detection import LicenseDetector, ActivityLogger
from imutils.video import VideoStream
from flask import Flask, Response, render_template, jsonify
from flask_cors import CORS
import threading
import argparse
import datetime
import imutils
import time
import cv2

outputFrame = None
lock = threading.Lock()
al = ActivityLogger()

app = Flask(__name__)
CORS(app)

@app.route("/")
def index():
	return render_template("index.html")

def detect_license(frameCount, where, camera):
	global vs, outputFrame, lock, license, activity_log, al
	print(f'Using camera -> {camera} and location -> {where}')
	vs = VideoStream(src=camera).start()
	time.sleep(2.0)

	md = LicenseDetector()

	while True:
		frame = vs.read()
		frame = imutils.resize(frame, width=400)
		timestamp = datetime.datetime.now()
		license = md.license_detect(frame)
		al.update_activity_log(license, where)
		if license is None:
			cv2.putText(frame, "No Car", (frame.shape[1] - 60, 15),
				cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 0, 255), 1)
		else:
			cv2.putText(frame, license, (frame.shape[1] - 60, 15),
				cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 255, 255), 1)
		cv2.putText(frame, timestamp.strftime(
			"%A %d %B %Y %I:%M:%S%p"), (10, frame.shape[0] - 10),
			cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 255, 0), 1)
		with lock:
			outputFrame = frame.copy()
		
def generate():
	global outputFrame, lock

	while True:
		with lock:
			if outputFrame is None:
				continue
			(flag, encodedImage) = cv2.imencode(".jpg", outputFrame)
			if not flag:
				continue
		yield(b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + 
			bytearray(encodedImage) + b'\r\n')

@app.route("/video-feed")
def video_feed():
	return Response(generate(),
		mimetype = "multipart/x-mixed-replace; boundary=frame")


@app.route('/api/detected-license')
def detected_license():
	global al
	return jsonify(detectedLicense=al.license)

@app.route('/api/activity-log')
def activity_log():
	global al
	return jsonify(al.activity_log[::-1])

@app.route('/api/clear-activity-log')
def clear_activity_log():
	global al
	al.clear()
	return jsonify(done=True)

if __name__ == '__main__':
	ap = argparse.ArgumentParser()
	ap.add_argument("-i", "--ip", type=str, required=True,
		help="ip address of the device")
	ap.add_argument("-o", "--port", type=int, required=True,
		help="ephemeral port number of the server (1024 to 65535)")
	ap.add_argument("-c", "--camera", type=int, default = 0,
		help="camera src (0 or 1)")
	ap.add_argument("-f", "--frame-count", type=int, default=32,
		help="# of frames used to construct the background model")
	ap.add_argument("-w", "--where", type=str, default='Parking Lot #1',
		help="Location of the camera to tag")
	args = vars(ap.parse_args())

	t = threading.Thread(target=detect_license, args=(
		args["frame_count"], args["where"], args["camera"]))
	t.daemon = True
	t.start()

	app.run(host=args["ip"], port=args["port"], debug=True,
		threaded=True, use_reloader=False)

vs.stop()