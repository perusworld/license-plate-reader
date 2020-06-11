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
import numpy as np

outputFrame = None
lock = threading.Lock()
fps = 10
writer = None
(h, w) = (None, None)
zeros = None

app = Flask(__name__)
CORS(app)

@app.route("/")
def index():
	return render_template("index.html")

def begin_recording():
	global writer, fps, h, w
	end_recording()
	fileName = 'videos/video-{date:%Y-%m-%d_%H-%M-%S}.avi'.format(date=datetime.datetime.now())
	print(f'recording to {fileName}')
	writer = cv2.VideoWriter(fileName, fourcc, fps, (w, h), True)

def end_recording():
	print('stopping recording')
	global writer
	if writer is not None:
		print('closing writer')
		writer.release()
		writer = None

def write_frame(frame):
	global zeros, h, w
	output = np.zeros((h, w, 3), dtype="uint8")
	output[0:h, 0:w] = frame
	try:
		writer.write(output)	
	except:
		print("An exception occurred while writing frame")


def detect_license(_fps, endpoint, where, location, camera, noise, codec):
	global vs, outputFrame, lock, license, activity_log, al, fourcc, writer, fps, h, w, zeros
	print(f'Using camera -> {camera}, \n\tendpoint -> {endpoint}, \n\tlocation -> {location}@{where}, \n\tnoise -> {noise}, \n\tfps -> {_fps}, \n\tcodec -> {codec}')
	fps = _fps
	vs = VideoStream(src=camera).start()
	time.sleep(2.0)

	fourcc = cv2.VideoWriter_fourcc(*args["codec"])

	md = LicenseDetector()
	al = ActivityLogger(noise, location, endpoint)

	while True:
		frame = vs.read()
		frame = imutils.resize(frame, width=400)
		timestamp = datetime.datetime.now()
		license = md.license_detect(frame)
		al.update_activity_log(license, where)
		cv2.putText(frame, f'{where}@{location}', (100, 15),
			cv2.FONT_HERSHEY_SIMPLEX, 0.50, (255, 255, 255), 1)
		if license is None:
			cv2.putText(frame, "No Car", (frame.shape[1] - 80, 15),
				cv2.FONT_HERSHEY_SIMPLEX, 0.50, (0, 0, 255), 1)
		else:
			cv2.putText(frame, license, (frame.shape[1] - 80, 15),
				cv2.FONT_HERSHEY_SIMPLEX, 0.50, (0, 255, 255), 1)
		cv2.putText(frame, timestamp.strftime(
			"%A %d %B %Y %I:%M:%S%p"), (10, frame.shape[0] - 10),
			cv2.FONT_HERSHEY_SIMPLEX, 0.50, (0, 255, 0), 1)

		if zeros is None:
			(h, w) = frame.shape[:2]
			zeros = np.zeros((h, w), dtype="uint8")
		if writer is not None:
			write_frame(frame.copy())
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

@app.route('/api/start-recording')
def start_recording():
	begin_recording()
	return jsonify(done=True)

@app.route('/api/stop-recording')
def stop_recording():
	end_recording()
	return jsonify(done=True)

if __name__ == '__main__':
	ap = argparse.ArgumentParser()
	ap.add_argument("-i", "--ip", type=str, required=True,
		help="ip address of the device")
	ap.add_argument("-o", "--port", type=int, required=True,
		help="ephemeral port number of the server (1024 to 65535)")
	ap.add_argument("-c", "--camera", type=int, default = 0,
		help="camera src (0 or 1)")
	ap.add_argument("-n", "--noise", type=int, default = 3,
		help="noise threshold (3)")
	ap.add_argument("-f", "--fps", type=int, default=10,
		help="fps of output video")
	ap.add_argument("-v", "--codec", type=str, default="MJPG",
		help="codec of output video")
	ap.add_argument("-w", "--where", type=str, default='Parking Lot #1',
		help="Location of this camera to tag")
	ap.add_argument("-l", "--location", type=str, default='Airport',
		help="Location of this set of cameras")
	ap.add_argument("-e", "--endpoint", type=str, default='',
		help="API Logger Endpoint")
	args = vars(ap.parse_args())

	t = threading.Thread(target=detect_license, args=(
		args["fps"], args["endpoint"], args["where"], args["location"], args["camera"], args["noise"], args["codec"]))
	t.daemon = True
	t.start()

	app.run(host=args["ip"], port=args["port"], debug=True,
		threaded=True, use_reloader=False)

vs.stop()