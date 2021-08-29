"""A setuptools based setup module.

See:
https://packaging.python.org/guides/distributing-packages-using-setuptools/
https://github.com/pypa/sampleproject
"""

from setuptools import setup, find_packages

setup(
    name="ffdraft",
    version="2.0.0",
    description="A fantasy football draft app",
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    python_requires=">=3.6, <4",
    install_requires=["boto3", "bs4", "numpy", "pandas", "selenium"],
    entry_points={"console_scripts": ["ffdraft=main:run"]},
)
